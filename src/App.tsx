import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import About from "./pages/About";
import Alerts from "./pages/Alerts";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";

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
        url: "https://memecoin-scanner.com",
        icons: ["https://memecoin-scanner.com/favicon.ico"],
      },
    },
  }),
];

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-background">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/scan" element={<Scan />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </QueryClientProvider>
);

export default App;