import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bitcoin } from "lucide-react";
import TrendingTokensService from '@/services/TrendingTokensService';
import { Memecoin } from '@/types/memecoin';
import { getRiskColor } from '@/utils/riskCalculator';

interface TokenBannerProps {
  hasAccess: boolean;
}

export const TokenBanner = ({ hasAccess }: TokenBannerProps) => {
  const [trendingTokens, setTrendingTokens] = useState<Memecoin[]>([]);
  const [mostBoughtTokens, setMostBoughtTokens] = useState<Memecoin[]>([]);
  
  useEffect(() => {
    const service = TrendingTokensService.getInstance();
    setTrendingTokens(service.getTrendingTokens(hasAccess));
    setMostBoughtTokens(service.getMostBoughtTokens(hasAccess));

    const interval = setInterval(() => {
      setTrendingTokens(service.getTrendingTokens(hasAccess));
      setMostBoughtTokens(service.getMostBoughtTokens(hasAccess));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [hasAccess]);
  
  return (
    <div className="w-full overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll">
        {trendingTokens.map((token, index) => (
          <Card 
            key={index}
            className="flex items-center gap-3 p-3 min-w-[200px] bg-white/5 backdrop-blur-sm"
          >
            <div className="flex-shrink-0">
              {token.logoUrl ? (
                <img 
                  src={token.logoUrl} 
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <Bitcoin className="w-8 h-8 text-crypto-purple" />
              )}
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-medium transition-all duration-300",
                hasAccess ? "blur-none" : "blur-sm"
              )}>
                {token.name}
              </span>
              <span className="text-sm text-muted-foreground">
                ${(token.marketCap / 1000000).toFixed(2)}M
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm",
                  getRiskColor(token.riskScore || 5)
                )}>
                  Risk: {token.riskScore}
                </span>
                <span className="text-sm text-muted-foreground">
                  {token.bundledBuys} buys
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};