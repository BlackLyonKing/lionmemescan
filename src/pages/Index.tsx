
import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrialAccessDialog } from "@/components/TrialAccessDialog";
import { Search, TrendingUp, Rocket, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { webSocketService } from "@/services/WebSocketService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PumpPortalService } from "@/services/PumpPortalService";

interface Token {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h?: number;
  marketCap?: number;
  address?: string;
  holders?: number;
}

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { timeRemaining, formattedTime } = useTrialCountdown();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    console.log('Initializing WebSocket connection...');
    webSocketService.connect();

    const handleMessage = (data: any) => {
      console.log('Received message:', data);

      if (data.type === 'token') {
        const newToken = {
          symbol: data.data.symbol,
          name: data.data.name,
          price: parseFloat(data.data.price || '0'),
          priceChange24h: parseFloat(data.data.priceChange24h || '0'),
          volume24h: parseFloat(data.data.volume24h || '0'),
          marketCap: parseFloat(data.data.marketCap || '0'),
          address: data.data.address,
          holders: parseInt(data.data.holders || '0'),
        };

        setTokens(current => {
          const exists = current.find(t => t.symbol === newToken.symbol);
          if (exists) {
            return current.map(t => t.symbol === newToken.symbol ? newToken : t);
          }
          return [...current, newToken].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)).slice(0, 100);
        });
        setIsLoading(false);
      }
    };

    webSocketService.subscribeToMessages(handleMessage);
    return () => {
      webSocketService.unsubscribeFromMessages(handleMessage);
      webSocketService.disconnect();
    };
  }, []);

  const handleTrade = async (token: Token, action: 'buy' | 'sell') => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to trade",
        variant: "destructive",
      });
      return;
    }

    if (!token.address) {
      toast({
        title: "Invalid token",
        description: "Token address not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await PumpPortalService.executeTrade({
        action,
        mint: token.address,
        amount: 0.1,
        denominatedInSol: true,
        slippage: 10,
        priorityFee: 0.005,
        pool: 'pump'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: `${action.toUpperCase()} Order Executed`,
        description: `Transaction signature: ${response.signature?.slice(0, 8)}...`,
        className: "bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white",
      });
    } catch (error) {
      console.error('Trade error:', error);
      toast({
        title: "Trade failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
    }
  };

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

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-crypto-purple" />
                <h2 className="text-xl font-bold">Trending Tokens</h2>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-crypto-purple text-crypto-purple">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Market
                </Button>
                <Button className="bg-gradient-to-r from-crypto-purple to-crypto-cyan">
                  <Rocket className="h-4 w-4 mr-2" />
                  Launch Token
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map((token, index) => (
                  <Card
                    key={`${token.symbol}-${index}`}
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-crypto-purple/50 transition-all duration-200"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{token.symbol}</h3>
                          <p className="text-sm text-muted-foreground truncate" title={token.name}>
                            {token.name}
                          </p>
                        </div>
                        <div className={`flex items-center ${
                          token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {token.priceChange24h >= 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          <span className="ml-1">
                            {Math.abs(token.priceChange24h).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">${token.price.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">MCap</p>
                          <p className="font-medium">${token.marketCap?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="font-medium">${token.volume24h?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Holders</p>
                          <p className="font-medium">{token.holders?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTrade(token, 'buy')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                        >
                          Buy
                        </Button>
                        <Button
                          onClick={() => handleTrade(token, 'sell')}
                          variant="outline"
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          Sell
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

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
