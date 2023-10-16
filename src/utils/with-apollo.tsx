import { ApolloProvider } from "@apollo/react-hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { concat, split } from "apollo-link";
import { setContext } from "apollo-link-context";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import fetch from "isomorphic-unfetch";
import cookie from "js-cookie";
import App from "next/app";
import Head from "next/head";
import React from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { API_URI, WS_URI } from "./constants";

let globalApolloClient = null;

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
function initApolloClient(initialState?: any, headers?: any): any {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(initialState, headers);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState, headers);
  }

  return globalApolloClient;
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 */
export const withApollo =
  ({ ssr = true } = {}) =>
  (PageComponent) => {
    const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
      const client = apolloClient || initApolloClient(apolloState, {});
      return (
        <ApolloProvider client={client}>
          <PageComponent {...pageProps} />
        </ApolloProvider>
      );
    };

    // Set the correct displayName in development
    if (process.env.NODE_ENV !== "production") {
      const displayName =
        PageComponent.displayName || PageComponent.name || "Component";

      WithApollo.displayName = `withApollo(${displayName})`;
    }

    if (PageComponent.getLayout) {
      WithApollo.getLayout = PageComponent.getLayout;
    }

    if (ssr || PageComponent.getInitialProps) {
      WithApollo.getInitialProps = async (ctx) => {
        const { AppTree, req } = ctx;
        const inAppContext = Boolean(ctx.ctx);
        // if (process.env.NODE_ENV === 'development') {
        //   if (inAppContext) {
        //     console.warn(
        //       'Warning: You have opted-out of Automatic Static Optimization due to `withApollo` in `pages/_app`.\n' +
        //         'Read more: https://err.sh/next.js/opt-out-auto-static-optimization\n'
        //     );
        //   }
        // }

        if (ctx.apolloClient) {
          throw new Error("Multiple instances of withApollo found.");
        }

        // Initialize ApolloClient
        const apolloClient = (ctx.apolloClient = initApolloClient({}));

        // Add apolloClient to NextPageContext & NextAppContext
        // This allows us to consume the apolloClient inside our
        // custom `getInitialProps({ apolloClient })`.
        ctx.apolloClient = apolloClient;
        if (inAppContext) {
          ctx.ctx.apolloClient = apolloClient;
        }

        // Run wrapped getInitialProps methods
        let pageProps = {};
        if (PageComponent.getInitialProps) {
          pageProps = await PageComponent.getInitialProps(ctx);
        } else if (inAppContext) {
          pageProps = await App.getInitialProps(ctx);
        }
        // Only on the server:
        if (typeof window === "undefined") {
          // When redirecting, the response is finished.
          // No point in continuing to render
          if (ctx.res && ctx.res.finished) {
            return pageProps;
          }

          // Only if ssr is enabled
          if (ssr) {
            try {
              // Run all GraphQL queries
              const { getDataFromTree } = await import("@apollo/react-ssr");

              // Since AppComponents and PageComponents have different context types
              // we need to modify their props a little.
              let props;
              if (inAppContext) {
                props = { ...pageProps, apolloClient };
              } else {
                props = { pageProps: { ...pageProps, apolloClient } };
              }

              // Takes React AppTree, determine which queries are needed to render,
              // then fetche them all.
              await getDataFromTree(<AppTree {...props} />);
            } catch (error) {
              // Prevent Apollo Client GraphQL errors from crashing SSR.
              // Handle them in components via the data.error prop:
              // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
              console.error("Error while running `getDataFromTree`", error);
            }

            // getDataFromTree does not call componentWillUnmount
            // head side effect therefore need to be cleared manually
            // @ts-ignore
            //Head.rewind();
          }
        }

        // Extract query data from the Apollo store
        const apolloState = apolloClient.cache.extract();

        return {
          ...pageProps,
          apolloState,
        };
      };
    }

    return WithApollo;
  };

function createApolloClient(initialState: any, builtHeaders?: any) {
  const fetchOptions = {};
  // If you are using a https_proxy, add fetchOptions with 'https-proxy-agent' agent instance
  // 'https-proxy-agent' is required here because it's a sever-side only module
  if (typeof window === "undefined") {
    if (process.env.https_proxy) {
      // @ts-ignore
      fetchOptions.agent = new (require("https-proxy-agent"))(
        process.env.https_proxy
      );
    }
  }

  const authLink = setContext((request, { headers }) => {
    return {
      ...builtHeaders,
    };
  });

  let wsLink;

  if (typeof window !== "undefined") {
    // Create a WebSocket link:
    wsLink = new WebSocketLink(
      new SubscriptionClient(WS_URI, {
        reconnect: true,
        timeout: 30000,
        connectionParams: () => {
          return builtHeaders;
        },
        connectionCallback: (err) => {
          if (err) {
            wsLink.subscriptionClient.close(false, false);
          }
        },
      })
    );
  }

  const httpLink = new HttpLink({
    uri: API_URI, // Server URL (must be absolute)
    credentials: "same-origin",
    fetch,
    fetchOptions,
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Disables forceFetch on the server (so queries are only run once)
    link: concat(
      authLink,
      typeof window !== "undefined"
        ? split(
            // split based on operation type
            ({ query }) => {
              // @ts-ignore
              const { kind, operation } = getMainDefinition(query);
              return (
                kind === "OperationDefinition" && operation === "subscription"
              );
            },
            // @ts-ignore
            wsLink,
            httpLink
          )
        : httpLink
    ),
    cache: new InMemoryCache({
      addTypename: true,
    }).restore(initialState),
  });
}
