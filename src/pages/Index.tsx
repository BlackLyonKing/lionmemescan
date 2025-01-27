import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { TokenBanner } from "@/components/TokenBanner";
import { BacktestingDashboard } from "@/components/BacktestingDashboard";
import { Navigation } from "@/components/Navigation";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { TopTokensBanner } from "@/components/TopTokensBanner";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrialAccessDialog } from "@/components/TrialAccessDialog";

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
  const [showTerms, setShowTerms] = useState(false);
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { timeRemaining, formattedTime } = useTrialCountdown();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  useEffect(() => {
    if (publicKey) {
      checkAccess();
    }
  }, [publicKey]);

  const checkAccess = async () => {
    if (!publicKey) return;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select()
      .eq('wallet_address', publicKey.toString())
      .single();

    if (subscription) {
      setHasAccess(true);
      return;
    }

    const trialData = localStorage.getItem(`trialStartTime_${publicKey.toString()}`);
    if (!trialData) {
      setShowTerms(true);
    } else {
      setHasAccess(true);
    }
  };

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

          {!publicKey && (
            <div className="flex justify-center mb-8">
              <WalletButton />
            </div>
          )}

          {timeRemaining !== null && timeRemaining > 0 && (
            <div className="bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white px-4 py-2 rounded-lg inline-block">
              Trial Time Remaining: {formattedTime}
            </div>
          )}
        </div>

        <TrialAccessDialog 
          open={showTerms} 
          onOpenChange={setShowTerms}
          onAccessGranted={() => setHasAccess(true)}
        />

        <TopTokensBanner />
        <TokenBanner hasAccess={hasAccess || isAdmin} />

        {(hasAccess || isAdmin) && (
          <div className="space-y-8">
            <TrendingBanner />
            <BacktestingDashboard historicalData={mockMemecoins} />
            <MemecoinsTable coins={mockMemecoins} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;