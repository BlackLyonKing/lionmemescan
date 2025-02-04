import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bitcoin, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TokenBannerProps {
  hasAccess: boolean;
}

interface Token {
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  contractAddress: string;
}

const fetchTopTokens = async (): Promise<Token[]> => {
  console.log('Fetching top tokens data');
  const { data, error } = await supabase.functions.invoke('fetch-top-tokens');
  
  if (error) {
    console.error('Error fetching top tokens:', error);
    throw error;
  }
  
  return data;
};

export const TokenBanner = ({ hasAccess }: TokenBannerProps) => {
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['topTokens'],
    queryFn: fetchTopTokens,
    refetchInterval: 60000, // Refetch every minute
  });
  
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden mb-8">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card 
              key={i}
              className="flex items-center gap-3 p-3 min-w-[250px] bg-white/5 backdrop-blur-sm animate-pulse"
            >
              <div className="h-8 w-8 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-4 w-16 bg-white/10 rounded" />
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
        {tokens.map((token, index) => (
          <Card 
            key={index}
            className="flex items-center gap-3 p-3 min-w-[250px] bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex-shrink-0">
              <Bitcoin className="w-8 h-8 text-crypto-purple" />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-medium transition-all duration-300",
                hasAccess ? "blur-none" : "blur-sm"
              )}>
                {token.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
                  ${token.price.toFixed(6)}
                </span>
                <span className={cn(
                  "text-xs flex items-center gap-1",
                  token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {token.priceChange24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(token.priceChange24h).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Vol: ${(token.volume24h / 1000000).toFixed(2)}M</span>
                <span>MCap: ${(token.marketCap / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};