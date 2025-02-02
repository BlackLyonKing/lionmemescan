import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { TokenBanner } from "@/components/TokenBanner";
import { BacktestingDashboard } from "@/components/BacktestingDashboard";
import { Navigation } from "@/components/Navigation";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrialAccessDialog } from "@/components/TrialAccessDialog";
import { Search, TrendingUp, Zap, BarChart3 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-radial from-dark-100 to-dark-200 text-foreground">
      <Navigation />
      
      <div className="container mx-auto pt-24 space-y-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 gradient-text">
            Memecoin Scanner
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Your advanced toolkit for discovering and analyzing the next big memecoins on Solana. 
            Get real-time insights, track social metrics, and stay ahead of the market.
          </p>

          {!publicKey && (
            <div className="flex justify-center mb-8">
              <WalletButton />
            </div>
          )}

          {timeRemaining !== null && timeRemaining > 0 && (
            <div className="dark-glass px-6 py-3 rounded-xl inline-block">
              <span className="gradient-text font-semibold">
                Trial Time Remaining: {formattedTime}
              </span>
            </div>
          )}
        </div>

        <div className="search-container mb-12">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by token name, symbol, or contract address..."
            className="search-input"
          />
          <div className="flex gap-4 mt-4 justify-center">
            <button className="filter-button active-filter">
              <TrendingUp className="w-4 h-4 inline-block mr-2" />
              Trending
            </button>
            <button className="filter-button">
              <Zap className="w-4 h-4 inline-block mr-2" />
              New Listings
            </button>
            <button className="filter-button">
              <BarChart3 className="w-4 h-4 inline-block mr-2" />
              Top Gainers
            </button>
          </div>
        </div>

        <TrialAccessDialog 
          open={showTerms} 
          onOpenChange={setShowTerms}
          onAccessGranted={() => setHasAccess(true)}
        />

        <TokenBanner hasAccess={hasAccess || isAdmin} />

        {(hasAccess || isAdmin) && (
          <div className="space-y-8">
            <TrendingBanner />
            <BacktestingDashboard />
            <MemecoinsTable coins={mockMemecoins} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;