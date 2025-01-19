import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bitcoin } from "lucide-react";

interface Token {
  name: string;
  symbol: string;
  logo?: string;
  price?: number;
  change24h?: number;
}

interface TokenBannerProps {
  hasAccess: boolean;
}

export const TokenBanner = ({ hasAccess }: TokenBannerProps) => {
  const [tokens, setTokens] = useState<Token[]>([
    {
      name: "Sample Token 1",
      symbol: "ST1",
      price: 0.00123,
      change24h: 5.2
    },
    {
      name: "Sample Token 2",
      symbol: "ST2",
      price: 0.00045,
      change24h: -2.8
    },
    // Add more sample tokens as needed
  ]);
  
  return (
    <div className="w-full overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll">
        {tokens.map((token, index) => (
          <Card 
            key={index}
            className="flex items-center gap-3 p-3 min-w-[200px] bg-white/5 backdrop-blur-sm"
          >
            <div className="flex-shrink-0">
              {token.logo ? (
                <img 
                  src={token.logo} 
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
                ${token.price?.toFixed(6)}
              </span>
              <span className={cn(
                "text-sm",
                token.change24h && token.change24h > 0 ? "text-green-500" : "text-red-500"
              )}>
                {token.change24h > 0 ? "+" : ""}{token.change24h}%
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};