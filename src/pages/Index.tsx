import { WalletButton } from "@/components/WalletButton";
import { PaymentGate } from "@/components/PaymentGate";
import { useState } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { UserProfile } from "@/components/UserProfile";
import { TokenBanner } from "@/components/TokenBanner";
import { BacktestingDashboard } from "@/components/BacktestingDashboard";
import { Navigation } from "@/components/Navigation";
import { SolanaPrice } from "@/components/SolanaPrice";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { Memecoin } from '@/types/memecoin';
import { useWallet } from "@solana/wallet-adapter-react";

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const { publicKey } = useWallet();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  // Mock data for development
  const mockMemecoins: Memecoin[] = [
    {
      name: "Sample Coin 1",
      symbol: "SC1",
      marketCap: 1000000,
      threadUrl: "https://example.com/sc1",
      threadComments: 10,
      dexStatus: "paid",
      graduated: false,
      socialScore: 80,
      meta: ["sample", "coin"],
      bundledBuys: 1,
      creatorRisk: { previousScams: 0, riskLevel: "low" },
      whaleStats: { maxHolderPercentage: 10, developerHoldingPercentage: 2 },
      liquidityStats: { percentageChange24h: 5, totalLiquidity: 50000 },
      riskScore: 3,
      logoUrl: "https://example.com/logo1.png",
    },
    {
      name: "Sample Coin 2",
      symbol: "SC2",
      marketCap: 2000000,
      threadUrl: "https://example.com/sc2",
      threadComments: 5,
      dexStatus: "unpaid",
      graduated: false,
      socialScore: 60,
      meta: ["sample", "coin"],
      bundledBuys: 3,
      creatorRisk: { previousScams: 1, riskLevel: "medium" },
      whaleStats: { maxHolderPercentage: 20, developerHoldingPercentage: 5 },
      liquidityStats: { percentageChange24h: -10, totalLiquidity: 30000 },
      riskScore: 7,
      logoUrl: "https://example.com/logo2.png",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto py-8 space-y-8 px-4">
        <TokenBanner hasAccess={hasAccess || isAdmin} />

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
      </div>
    </div>
  );
};

export default Index;
