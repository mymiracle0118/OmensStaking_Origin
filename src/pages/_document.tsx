import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro&display=swap"
            rel="stylesheet"
          />
          <link rel="shortcut icon" href="favicon.ico" />
          <link rel="apple-touch-icon" href="apple-touch-icon.png" />
          <meta property="og:title" content="OMENS" />
          <meta
            property="og:description"
            content="Born and raised in the underworld."
          />
          <meta property="og:url" content="https://dig.omens.art" />
          <meta
            property="og:image"
            content="https://dig.omens.art/og-image.png"
          />
          <meta name="theme-color" content="#b78628"></meta>
        </Head>
        <body className={"bg-black"} id={"modalBody"}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
