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
import { TrialStatus } from "@/components/TrialStatus";
import { useWallet } from "@solana/wallet-adapter-react";

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const { publicKey } = useWallet();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <TrialStatus />
      
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