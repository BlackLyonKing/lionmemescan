import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import "@solana/wallet-adapter-react-ui/styles.css";

// You can also provide a custom RPC endpoint
const endpoint = clusterApiUrl("devnet");
const network = WalletAdapterNetwork.Devnet;
const wallets = [
  new PhantomWalletAdapter(),
  new WalletConnectWalletAdapter({ network }) 
];

const App = () => (
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default App;