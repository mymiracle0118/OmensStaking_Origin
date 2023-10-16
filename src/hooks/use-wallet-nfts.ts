import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Transaction, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { getNftsForOwner } from "../utils/candy-machine";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { STAKING_WALLET } from "../utils/constants";

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const useWalletNfts = () => {
  const wallet = useWallet();
  const { publicKey, signTransaction, sendTransaction } = wallet;
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [nfts, setNfts] = useState<Array<any>>([]);

  const sendNFT = async (mintAddress: string[], isMarketTx?: boolean) => {
    setStatus("Creating transaction");
    try {
      const toPublicKey = new PublicKey(STAKING_WALLET);
      const transaction = new Transaction();

      for (const _m of mintAddress) {
        setStatus(`Fetching program acconts for mint ${_m}`);
        const res = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST, {
          body: `{
              "jsonrpc":"2.0", 
              "id":1, 
              "method":"getProgramAccounts", 
              "params":[
                "${TOKEN_PROGRAM_ID}",
                {
                  "encoding": "jsonParsed",
                  "filters": [
                    {
                      "dataSize": 165
                    },
                    {
                      "memcmp": {
                        "offset": 0,
                        "bytes": "${_m}"
                      }
                    }
                  ]
                }
              ]}
          `,
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const json = await res.json();
        const validAccount = json.result.filter(
          (r) => r.account.data.parsed.info.tokenAmount.uiAmount > 0
        )?.[0]?.pubkey;
        setStatus(`Creating instructions for mint ${_m}`);
        transaction.add(
          Token.createSetAuthorityInstruction(
            TOKEN_PROGRAM_ID,
            new PublicKey(validAccount),
            toPublicKey,
            "AccountOwner",
            wallet.publicKey,
            []
          )
        );
      }
      setStatus(`Finished fetching mint data, computing TX fee`);
      const blockHash = await connection.getRecentBlockhash();
      transaction.feePayer = await publicKey;
      transaction.recentBlockhash = await blockHash.blockhash;
      setStatus(`Waiting for signature`);
      const signed = await signTransaction(transaction);
      setStatus(`Transaction signed, sending transaction`);
      const signature = await connection.sendRawTransaction(signed.serialize());
      setStatus(`Transaction sent, confirming`);
      try {
        connection.confirmTransaction(signature);
      } catch (e) {
        console.log(e);
      }
      setStatus(`Transaction confirming in background`);
      return {
        error: null,
        message: signature,
      };
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  };

  const getNFTs = async () => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      console.log("failed check");

      return;
    }

    setIsLoading(true);

    const nftsForOwner = await getNftsForOwner(connection, wallet.publicKey);
    console.log("nfts for owner", nftsForOwner);
    setNfts(nftsForOwner.filter((nft) => nft.symbol === "OMEN") as any);
    setIsLoading(false);
  };

  return [isLoading, nfts, getNFTs, sendNFT, status];
};

export default useWalletNfts;
