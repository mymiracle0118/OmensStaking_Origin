import { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachine,
  getCandyMachineState,
  mintMultipleToken,
  mintOneToken,
} from "../utils/candy-machine";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import useWalletBalance from "./use-wallet-balance";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { sleep } from "../utils/utility";

const MINT_PRICE_SOL = 0.33;

const treasury = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS!
);

const config = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_CANDY_MACHINE_CONFIG!
);

const candyMachineId = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!
);

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const txTimeout = 30000;

export default function useCandyMachine() {
  const [_, setBalance] = useWalletBalance();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();
  const wallet = useWallet();
  const [currentStep, setCurrentStep] = useState<string>("");
  const [nftsData, setNftsData] = useState<any>(
    ({} = {
      itemsRemaining: 0,
      itemsRedeemed: 0,
      itemsAvailable: 0,
    } as any)
  );
  const [isMinting, setIsMinting] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [mintStartDate, setMintStartDate] = useState(
    new Date(parseInt(process.env.NEXT_PUBLIC_CANDY_START_DATE!, 10))
  );

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as typeof anchor.Wallet;

      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(anchorWallet, candyMachineId, connection);

      setIsSoldOut(itemsRemaining === 0);
      setMintStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, candyMachineId, connection]);

  useEffect(() => {
    (async () => {
      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as typeof anchor.Wallet;

      const { itemsRemaining, itemsRedeemed, itemsAvailable } =
        await getCandyMachineState(anchorWallet, candyMachineId, connection);

      setNftsData({ itemsRemaining, itemsRedeemed, itemsAvailable });
      setIsSoldOut(itemsRemaining === 0);
    })();
  }, [wallet, candyMachineId, connection, isMinting]);

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setCurrentStep("Creating mint transaction...");
        const mintTxId = await mintOneToken(
          candyMachine,
          config,
          wallet.publicKey,
          treasury
        );
        setCurrentStep("Created mint transaction, now confirming...");
        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          txTimeout,
          connection,
          "singleGossip",
          false
        );
        // @ts-ignore
        if (!status?.err) {
          setCurrentStep("Confirmed... Mint successful");

          toast.success(
            "Companions Minted! Your NFT's should appear in your wallet."
          );
          setIsMinting(false);
        } else {
          setCurrentStep("Confirmed... Mint Failed");

          toast.error("Mint failed! Please try again!");
          setIsMinting(false);
        }
      }
    } catch (error: any) {
      setIsMinting(false);
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        setIsMinting(false);
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }
      toast.error(message);
    } finally {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  const onMintMultiple = async (quantity: number) => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setCurrentStep("Creating mint transaction(s)...");
        const signedTransactions: any = await mintMultipleToken(
          candyMachine,
          config,
          wallet.publicKey,
          treasury,
          quantity
        );
        setCurrentStep("Created mint transaction(s), now confirming...");

        const promiseArray = [];

        for (let index = 0; index < signedTransactions.length; index++) {
          setCurrentStep(`Confirming TX #${index + 1}... Mint successful`);

          const tx = signedTransactions[index];
          promiseArray.push(
            awaitTransactionSignatureConfirmation(
              tx,
              txTimeout,
              connection,
              "singleGossip",
              true
            )
          );
        }

        const allTransactionsResult = await Promise.all(promiseArray);
        let totalSuccess = 0;
        let totalFailure = 0;

        for (let index = 0; index < allTransactionsResult.length; index++) {
          const transactionStatus = allTransactionsResult[index];
          if (!transactionStatus?.err) {
            totalSuccess += 1;
          } else {
            totalFailure += 1;
          }
        }

        if (totalSuccess > 0) {
          toast.success(
            `${totalSuccess} companions minted! Your NFT's should appear in your wallet.`,
            { duration: 6000, position: "bottom-center" }
          );
          setCurrentStep("Confirmed... Mint successful");
          setIsMinting(false);
        }

        if (totalFailure > 0) {
          setCurrentStep("Confirmed... Mint failed");

          setIsMinting(false);
          toast.error(
            `Some mints failed! ${totalFailure} mints failed! Check on your wallet :(`,
            { duration: 6000, position: "bottom-center" }
          );
        }
      }
    } catch (error: any) {
      setIsMinting(false);
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        setIsMinting(false);
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }
      toast.error(message);
    } finally {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  return {
    isSoldOut,
    mintStartDate,
    isMinting,
    nftsData,
    onMint,
    onMintMultiple,
    currentStep,
  };
}
