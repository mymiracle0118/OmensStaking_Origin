import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { createContext, useContext, useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { getOrCreateAssociatedTokenAccount } from "../utils/getOrCreateAssociatedTokenAccount";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const BalanceContext = createContext<any>(null);

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

export const useStyxBalance = () => {
  const wallet = useWallet();
  const [tokenBalance, setTokenBalance] = useState<number>(null);
  const STAKING_WALLET_STYX_TOKEN_ACCOUNT =
    "F6wB51mgrSc5oRX3xx7fJ6Ny6m6xpT7exf4J92VhPsd4";
  const STYX_MINT = "GiLAFSEGwJB3pmMkpAAznS9YBSPe82GtWugzwkBNvJ5v";
  const LAMPORTS_PER_STYX = 1000;

  const getStyxBalance = () => {
    connection
      .getTokenAccountBalance(new PublicKey(STAKING_WALLET_STYX_TOKEN_ACCOUNT))
      .then(({ value: { uiAmount } }) => setTokenBalance(uiAmount));
  };

  useEffect(() => {
    getStyxBalance();
    const interval = setInterval(() => {
      getStyxBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendStyx = async (amount: number) => {
    try {
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.publicKey,
        [STYX_MINT],
        wallet.publicKey,
        wallet.signTransaction
      );

      console.log(fromTokenAccount);
      const transaction = new anchor.web3.Transaction().add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          fromTokenAccount[STYX_MINT].address,
          new PublicKey(STAKING_WALLET_STYX_TOKEN_ACCOUNT),
          wallet.publicKey,
          [],
          amount * LAMPORTS_PER_STYX
        )
      );

      const blockHash = await connection.getRecentBlockhash();
      transaction.feePayer = await wallet.publicKey;
      transaction.recentBlockhash = await blockHash.blockhash;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      try {
        connection.confirmTransaction(signature);
        getStyxBalance();
      } catch (e) {
        console.log(e);
      }

      return {
        error: null,
        message: signature,
      };
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  };

  return { styxBalance: tokenBalance, sendStyx, getStyxBalance };
};

export default function useWalletBalance() {
  const wallet = useWallet();
  const [balance, setBalance] = useContext(BalanceContext);

  const sendOfferFunds = async (value: number) => {
    try {
      const toPublicKey = new PublicKey(
        "5UbZjGtR3xhTpWXfpMejW2XV26TTiHWYzupP8SVmpwpt"
      );

      const transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: toPublicKey,
          lamports: value * anchor.web3.LAMPORTS_PER_SOL,
        })
      );

      const blockHash = await connection.getRecentBlockhash();
      transaction.feePayer = await wallet.publicKey;
      transaction.recentBlockhash = await blockHash.blockhash;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      try {
        connection.confirmTransaction(signature);
      } catch (e) {
        console.log(e);
      }

      return {
        error: null,
        message: signature,
      };
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  };

  return [balance, setBalance, sendOfferFunds];
}

export const WalletBalanceProvider = ({ children }: any) => {
  const wallet = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, connection]);

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, connection]);

  return (
    <BalanceContext.Provider value={[balance, setBalance]}>
      {children}
    </BalanceContext.Provider>
  );
};
