import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { UserProfile } from "@/components/UserProfile";
import { TokenBanner } from "@/components/TokenBanner";
import { BacktestingDashboard } from "@/components/BacktestingDashboard";
import { Navigation } from "@/components/Navigation";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { TopTokensBanner } from "@/components/TopTokensBanner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const TERMS_AND_CONDITIONS = `
By accepting these terms, you acknowledge and agree to the following:

1. This is a trial version of our premium service.
2. The trial period lasts for 40 hours from activation.
3. We may collect and analyze usage data to improve our services.
4. You are responsible for any actions taken through your wallet during the trial.
5. We reserve the right to terminate the trial at any time.
6. After the trial period ends, you'll need to purchase a subscription to continue accessing premium features.
7. This agreement is governed by applicable laws and regulations.
`;

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { startTrial, timeRemaining, formattedTime } = useTrialCountdown();
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

  const handleTermsAccept = async () => {
    if (!publicKey) return;
    
    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingTrials, error: trialError } = await supabase
        .from('trial_attempts')
        .select()
        .eq('wallet_address', publicKey.toString());

      if (trialError) throw trialError;

      if (existingTrials && existingTrials.length > 0) {
        toast({
          title: "Trial Not Available",
          description: "You have already used your free trial",
          variant: "destructive",
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('trial_attempts')
        .insert([{ 
          wallet_address: publicKey.toString(),
          ip_address: await fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip)
        }]);

      if (insertError) throw insertError;

      startTrial();
      setHasAccess(true);
      setShowTerms(false);
      
      toast({
        title: "Trial Activated",
        description: "Your 40-hour Kings tier trial has been activated!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
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

        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Terms & Conditions</DialogTitle>
              <DialogDescription>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-muted p-6">
                    <pre className="text-sm whitespace-pre-wrap">{TERMS_AND_CONDITIONS}</pre>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions
                    </label>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleTermsAccept} disabled={!acceptedTerms}>
                Start Free Trial
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TopTokensBanner />
        <TokenBanner hasAccess={hasAccess || isAdmin} />

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