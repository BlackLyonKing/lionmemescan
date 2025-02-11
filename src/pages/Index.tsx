
import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import { TokenBanner } from "@/components/TokenBanner";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrialAccessDialog } from "@/components/TrialAccessDialog";
import { Search, TrendingUp, Zap, BarChart3, Rocket } from "lucide-react";
import { webSocketService } from "@/services/WebSocketService";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { timeRemaining, formattedTime } = useTrialCountdown();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  const [latestToken, setLatestToken] = useState<{
    name: string;
    address: string;
    timestamp: string;
  } | null>(null);

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

  useEffect(() => {
    webSocketService.connect();

    const handleMessage = (data: any) => {
      if (data.type === 'newToken') {
        setLatestToken({
          name: data.token.name,
          address: data.token.address,
          timestamp: new Date().toLocaleString()
        });
        
        toast({
          title: "New Token Created",
          description: `${data.token.name} has been created`,
          className: "bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white",
        });
      }
    };

    webSocketService.subscribeToMessages(handleMessage);

    return () => {
      webSocketService.unsubscribeFromMessages(handleMessage);
      webSocketService.disconnect();
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-radial from-orbo-dark to-orbo-darker text-foreground">
      <Navigation />
      
      <div className="container mx-auto pt-24 space-y-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 gradient-text">
            PumpFun Scanner
          </h1>
          <p className="text-xl text-orbo-lightGray max-w-2xl mx-auto mb-8">
            Advanced real-time analytics for PumpFun tokens. Track new token launches, 
            monitor trading activity, and receive instant alerts on trending tokens. 
            Our platform provides professional-grade tools for identifying early opportunities 
            and analyzing market movements on the PumpFun ecosystem.
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

        {latestToken && (
          <Alert className="bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10 border border-crypto-purple/20">
            <AlertDescription>
              New token created: {latestToken.name} 
              <span className="text-sm text-muted-foreground ml-2">
                ({latestToken.timestamp})
              </span>
            </AlertDescription>
          </Alert>
        )}

        <TokenBanner hasAccess={hasAccess || isAdmin} />

        <TrialAccessDialog 
          open={showTerms} 
          onOpenChange={setShowTerms}
          onAccessGranted={() => setHasAccess(true)}
        />
      </div>
    </div>
  );
};

export default Index;
