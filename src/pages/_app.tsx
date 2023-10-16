import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletBalanceProvider } from "../hooks/use-wallet-balance";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import Modal from "react-modal";
import { DigsiteProvider } from "../hooks/use-current-digsite";

let WALLETS: any = {
  getPhantomWallet: () => ({ name: "Phantom" }),
  getSolflareWallet: () => ({ name: "Solflare" }),
  getSolletWallet: () => ({ name: "Sollet" }),
};
if (typeof window !== "undefined") {
  WALLETS = require("@solana/wallet-adapter-wallets");
}

const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork;

const App = ({ Component, pageProps }: any) => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  Modal.setAppElement("#modalBody");

  const wallets = useMemo(
    () => [
      WALLETS.getPhantomWallet(),
      WALLETS.getSolflareWallet(),
      WALLETS.getSolletWallet(),
    ],
    []
  );

  return (
    <>
      <Head>
        <title>OMENS - Dig Sites</title>
      </Head>
      <ConnectionProvider endpoint={endpoint}>
        <DigsiteProvider>
          <WalletProvider wallets={wallets} autoConnect={false}>
            <WalletModalProvider>
              <WalletBalanceProvider>
                <Toaster position="top-center" reverseOrder={false} />
                <Component {...pageProps} />
              </WalletBalanceProvider>
            </WalletModalProvider>
          </WalletProvider>
        </DigsiteProvider>
      </ConnectionProvider>
    </>
  );
};

export default App;
