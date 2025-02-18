
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { webSocketService } from "@/services/WebSocketService";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { PumpPortalService } from "@/services/PumpPortalService";

interface TopToken {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h?: number;
  marketCap?: number;
  address?: string;
}

export const TopTokensBanner = () => {
  const navigate = useNavigate();
  const [topTokens, setTopTokens] = useState<TopToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { publicKey } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.type === 'tokenData') {
        const newToken = {
          symbol: data.token.symbol,
          name: data.token.name,
          price: parseFloat(data.token.price),
          priceChange24h: parseFloat(data.token.priceChange24h),
          volume24h: parseFloat(data.token.volume24h),
          marketCap: parseFloat(data.token.marketCap),
          address: data.token.address,
        };

        setTopTokens(current => {
          const exists = current.find(t => t.symbol === newToken.symbol);
          if (exists) {
            return current.map(t => t.symbol === newToken.symbol ? newToken : t);
          }
          return [...current, newToken].slice(-20); // Keep last 20 tokens
        });
        setIsLoading(false);
      } else if (data.type === 'newToken') {
        // Handle new token creation
        const newToken = {
          symbol: data.token.symbol,
          name: data.token.name,
          price: parseFloat(data.token.price || '0'),
          priceChange24h: 0,
          address: data.token.address,
        };
        
        setTopTokens(current => [newToken, ...current].slice(0, 20));
        toast({
          title: "New Token Created",
          description: `${newToken.name} (${newToken.symbol}) has been created`,
          className: "bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white",
        });
      }
    };

    webSocketService.subscribeToMessages(handleMessage);
    return () => {
      webSocketService.unsubscribeFromMessages(handleMessage);
    };
  }, [toast]);

  const handleTrade = async (token: TopToken, action: 'buy' | 'sell') => {
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

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-64 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll py-4">
        {topTokens.map((token, index) => (
          <Card
            key={`${token.symbol}-${index}`}
            className="flex-shrink-0 w-64 p-4 cursor-pointer bg-white/5 backdrop-blur-sm border-white/10 hover:border-crypto-purple/50 transition-all duration-200"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{token.symbol}</div>
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
              <div className="text-sm text-muted-foreground truncate" title={token.name}>
                {token.name}
              </div>
              <div className="text-sm font-medium">${token.price.toFixed(6)}</div>
              {token.volume24h && (
                <div className="text-xs text-muted-foreground">
                  Vol: ${token.volume24h.toLocaleString()}
                </div>
              )}
              {token.marketCap && (
                <div className="text-xs text-muted-foreground">
                  MCap: ${token.marketCap.toLocaleString()}
                </div>
              )}
              <div className="flex gap-2 mt-2">
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
    </div>
  );
};
