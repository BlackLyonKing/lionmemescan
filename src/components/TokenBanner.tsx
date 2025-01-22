import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bitcoin, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  logoUrl?: string;
}

interface TokenBannerProps {
  hasAccess: boolean;
}

export const TokenBanner = ({ hasAccess }: TokenBannerProps) => {
  const { data: topTokens, isLoading } = useQuery({
    queryKey: ["topSolanaTokens"],
    queryFn: async () => {
      console.log("Fetching top Solana tokens from DEXScreener...");
      const response = await fetch("https://api.dexscreener.com/latest/dex/tokens/solana");
      const data = await response.json();
      
      return data.pairs
        .sort((a: any, b: any) => b.volume.h24 - a.volume.h24)
        .slice(0, 20)
        .map((pair: any) => ({
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
          price: parseFloat(pair.priceUsd),
          priceChange24h: parseFloat(pair.priceChange.h24),
          volume24h: parseFloat(pair.volume.h24),
          logoUrl: pair.baseToken.logoUrl
        }));
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden mb-8">
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <Card 
              key={i}
              className="flex items-center gap-3 p-3 min-w-[250px] bg-white/5 backdrop-blur-sm animate-pulse"
            >
              <div className="w-8 h-8 rounded-full bg-gray-600" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-600 rounded" />
                <div className="h-4 w-32 bg-gray-600 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll">
        {topTokens?.map((token: TokenData, index: number) => (
          <Card 
            key={index}
            className="flex items-center gap-3 p-3 min-w-[250px] bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex-shrink-0">
              {token.logoUrl ? (
                <img 
                  src={token.logoUrl} 
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
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
                {token.symbol}
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
                ${token.price.toFixed(6)}
              </span>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "text-sm",
                          token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {token.priceChange24h >= 0 ? "+" : ""}
                          {token.priceChange24h.toFixed(2)}%
                        </span>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>24h Volume: ${(token.volume24h / 1000000).toFixed(2)}M</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};