import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import React, { useEffect } from "react";
import gql from "graphql-tag";
import useWalletNfts from "../../hooks/use-wallet-nfts";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenAddress } from "../../utils";

export const ConnectButton = () => {
  const wallet = useWallet();
  const [isLoading, nfts, getNFTs]: any = useWalletNfts();

  const [getItemsForWallet, { data: walletItemdata, loading: walletLoading }] =
    useLazyQuery(
      gql`
        query getItems($where: items_bool_exp) {
          items(where: $where) {
            mint
            type
          }
        }
      `
    );

  const [upsertItems] = useMutation(gql`
    mutation upsertItems($objects: [items_insert_input!]!) {
      insert_items(
        objects: $objects
        on_conflict: {
          constraint: items_pkey
          update_columns: [
            current_owner
            metadata
            allow_offers
            current_owner
            type
            mint
          ]
        }
      ) {
        returning {
          mint
        }
      }
    }
  `);

  useEffect(() => {
    if (nfts.length > 0) {
      getItemsForWallet({
        variables: {
          where: {
            mint: {
              _in: nfts.map((nft) => nft.mint),
            },
          },
        },
      });
    }
  }, [nfts]);

  useEffect(() => {
    if (!walletLoading && !isLoading) {
      const dbMints = walletItemdata?.items;
      console.log(nfts);
      Promise.all(nfts?.map((nft) => compareItemAndWallet(nft, dbMints))).then(
        (objects) => {
          return upsertItems({
            variables: {
              objects: objects,
            },
          });
        }
      );
    }
  }, [nfts, walletItemdata, walletLoading]);

  useEffect(() => {
    if (wallet.connected) {
      getNFTs();
    }
  }, [wallet]);

  const compareItemAndWallet = (nft, dbMints) => {
    const matchingItems = dbMints.filter((m) => m.mint === nft.mint);
    if (matchingItems.length > 0) {
      const item = matchingItems[0];
      // already exists. just check currentOwner.
      if (item.current_owner !== wallet.publicKey.toString()) {
        // this will be a upsert one
        return {
          mint: nft.mint,
          metadata: nft,
          current_owner: wallet.publicKey.toString(),
          type: nft.symbol,
        };
      }
    } else {
      return {
        mint: nft.mint,
        metadata: nft,
        is_listed: false,
        allow_offers: true,
        current_owner: wallet.publicKey.toString(),
        type: nft.symbol,
        in_rem: false,
      };
    }
  };

  return (
    <div className="flex">
      <WalletMultiButton startIcon={null} className={"connect-button"}>
        <p className="text-4.5xl mx-2 font-viet text-primary font-bold uppercase">
          {wallet?.connected
            ? `${shortenAddress(wallet.publicKey.toString(), 8)}`
            : wallet.connecting
            ? `Connecting`
            : "Connect"}
        </p>
      </WalletMultiButton>
    </div>
  );
};
