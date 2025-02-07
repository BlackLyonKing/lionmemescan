
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { webSocketService } from "@/services/WebSocketService";
import { Button } from "@/components/ui/button";
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
  const [selectedToken, setSelectedToken] = useState<TopToken | null>(null);
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
      }
    };

    webSocketService.subscribeToMessages(handleMessage);

    return () => {
      webSocketService.unsubscribeFromMessages(handleMessage);
    };
  }, []);

  const handleTokenClick = (token: TopToken) => {
    setSelectedToken(token);
  };

  const handleBuy = async (token: TopToken) => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
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
        token_address: token.address,
        amount: 0.1,
        side: 'BUY'
      });

      toast({
        title: "Purchase initiated",
        description: `Buying ${token.symbol} for 0.1 SOL`,
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-48 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll">
        {topTokens.map((token, index) => (
          <Card
            key={index}
            className={`flex-shrink-0 p-4 cursor-pointer hover:scale-105 transition-transform duration-200 bg-white/5 backdrop-blur-sm ${
              selectedToken?.symbol === token.symbol ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => handleTokenClick(token)}
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
              <div className="text-sm text-muted-foreground">{token.name}</div>
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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuy(token);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 mt-2"
              >
                Buy Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
