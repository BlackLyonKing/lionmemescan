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
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import About from "./pages/About";
import Alerts from "./pages/Alerts";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";
import Terms from "./pages/Terms";
import Transaction from "./pages/Transaction";
import React from 'react';

const endpoint = clusterApiUrl("devnet");
const network = WalletAdapterNetwork.Devnet;
const wallets = [
  new PhantomWalletAdapter(),
  new WalletConnectWalletAdapter({ 
    network,
    options: {
      projectId: "your-project-id",
      metadata: {
        name: "Memecoin Scanner",
        description: "Scan and analyze memecoins",
        url: window.location.origin,
        icons: ["https://your-app-icon.com"]
      }
    }
  })
];

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/transaction/:tokenSymbol" element={<Transaction />} />
                </Routes>
                <Toaster />
              </BrowserRouter>
            </TooltipProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;