
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { TokenCard } from "./TokenCard";

interface Token {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h?: number;
  marketCap?: number;
  address?: string;
  holders?: number;
  createdAt?: Date;
}

interface TokenSectionProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  tokens: Token[];
  isLoading: boolean;
}

export const TokenSection = ({ title, icon, iconColor, tokens, isLoading }: TokenSectionProps) => {
  return (
    <div className="bg-gray-800/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={iconColor}>{icon}</div>
          <h2 className="font-semibold">{title}</h2>
        </div>
        <Button variant="ghost" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-700/20 animate-pulse rounded-lg" />
          ))
        ) : (
          tokens.map((token, index) => (
            <TokenCard key={`${token.symbol}-${index}`} token={token} />
          ))
        )}
      </div>
    </div>
  );
};
