import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { webSocketService } from "@/services/WebSocketService";

interface TopToken {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h?: number;
  marketCap?: number;
}

export const TopTokensBanner = () => {
  const navigate = useNavigate();
  const [topTokens, setTopTokens] = useState<TopToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect to WebSocket and subscribe to token data
    webSocketService.connect();

    const handleMessage = (data: any) => {
      if (data.type === 'tokenData') {
        const newToken = {
          symbol: data.token.symbol,
          name: data.token.name,
          price: parseFloat(data.token.price),
          priceChange24h: parseFloat(data.token.priceChange24h),
          volume24h: parseFloat(data.token.volume24h),
          marketCap: parseFloat(data.token.marketCap),
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

    // Cleanup on unmount
    return () => {
      webSocketService.unsubscribeFromMessages(handleMessage);
    };
  }, []);

  const handleTokenClick = (symbol: string) => {
    navigate(`/transaction/${symbol}`);
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
        {topTokens.map((token: TopToken, index: number) => (
          <Card
            key={index}
            className="flex-shrink-0 p-4 cursor-pointer hover:scale-105 transition-transform duration-200 bg-white/5 backdrop-blur-sm"
            onClick={() => handleTokenClick(token.symbol)}
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};