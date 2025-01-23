import { WalletButton } from "@/components/WalletButton";
import { PaymentGate } from "@/components/PaymentGate";
import { useState } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { UserProfile } from "@/components/UserProfile";
import { TokenBanner } from "@/components/TokenBanner";
import { BacktestingDashboard } from "@/components/BacktestingDashboard";
import { Navigation } from "@/components/Navigation";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { TopTokensBanner } from "@/components/TopTokensBanner";
import { Button } from "@/components/ui/button";

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
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const { publicKey } = useWallet();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto pt-24 space-y-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Memecoin Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Your advanced toolkit for discovering and analyzing the next big memecoins on Solana. 
            Get real-time insights, track social metrics, and stay ahead of the market with our 
            comprehensive scanning and analysis tools.
          </p>

          {/* Tier Selection */}
          <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto mb-8">
            <div className="p-6 border rounded-lg shadow-sm bg-background">
              <h3 className="text-xl font-bold mb-2">Free Trial</h3>
              <p className="text-muted-foreground mb-4">
                40 hours of Kings tier access
              </p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li>• Full feature access</li>
                <li>• No payment required</li>
                <li>• Limited time only</li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => setShowPaymentGate(true)}
              >
                Start Free Trial
              </Button>
            </div>

            <div className="p-6 border rounded-lg shadow-sm bg-background">
              <h3 className="text-xl font-bold mb-2">Basic Tier</h3>
              <p className="text-muted-foreground mb-4">
                0.1 SOL/month
              </p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li>• Basic memecoin scanning</li>
                <li>• Standard metrics</li>
                <li>• Email support</li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => setShowPaymentGate(true)}
              >
                Choose Basic
              </Button>
            </div>

            <div className="p-6 border rounded-lg shadow-sm bg-background relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white px-3 py-1 text-sm">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Kings Tier</h3>
              <p className="text-muted-foreground mb-4">
                0.2 SOL/month
              </p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li>• Advanced memecoin scanning</li>
                <li>• Real-time social metrics</li>
                <li>• AI-powered analysis</li>
                <li>• Priority support</li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90"
                onClick={() => setShowPaymentGate(true)}
              >
                Choose Kings
              </Button>
            </div>
          </div>
        </div>

        <TopTokensBanner />
        <TokenBanner hasAccess={hasAccess || isAdmin} />

        {showPaymentGate && !hasAccess && !isAdmin ? (
          <PaymentGate onPaymentSuccess={() => {
            setHasAccess(true);
            setShowPaymentGate(false);
          }} />
        ) : null}

        {(hasAccess || isAdmin) && (
          <div className="space-y-8">
            <TrendingBanner />
            <BacktestingDashboard historicalData={mockMemecoins} />
            <MemecoinsTable coins={mockMemecoins} />
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;