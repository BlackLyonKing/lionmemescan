import { WalletButton } from "@/components/WalletButton";
import { PaymentGate } from "@/components/PaymentGate";
import { useState, useEffect } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { UserProfile } from "@/components/UserProfile";
import { TokenBanner } from "@/components/TokenBanner";
import { BacktestingDashboard } from "@/components/BacktestingDashboard";
import { Navigation } from "@/components/Navigation";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { useWallet } from "@solana/wallet-adapter-react";

const mockMemecoins = [
  {
    name: "Sample Coin 1",
    symbol: "SAMP1",
    marketCap: 1000000,
    socialScore: 85,
    dexStatus: "unpaid" as const,
    meta: ["trending", "new"],
    threadUrl: "https://example.com",
    threadComments: 150,
    bundledBuys: 25,
    riskScore: 3,
    graduated: false
  },
];

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const { publicKey, connected } = useWallet();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  useEffect(() => {
    console.log("Index component mounted");
    console.log("Wallet connection status:", { connected, publicKey: publicKey?.toBase58() });
    return () => {
      console.log("Index component unmounted");
    };
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto pt-24 space-y-8 px-4 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Memecoin Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your advanced toolkit for discovering and analyzing the next big memecoins on Solana. 
            Get real-time insights, track social metrics, and stay ahead of the market with our 
            comprehensive scanning and analysis tools.
          </p>
        </div>

        {connected && <TokenBanner hasAccess={hasAccess || isAdmin} />}

        {!hasAccess && !isAdmin ? (
          <PaymentGate onPaymentSuccess={() => setHasAccess(true)} />
        ) : (
          <div className="space-y-8">
            <TrendingBanner />
            <BacktestingDashboard historicalData={mockMemecoins} />
            <MemecoinsTable coins={mockMemecoins} />
            <UserProfile />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;