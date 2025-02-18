
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

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

interface TokenCardProps {
  token: Token;
}

export const TokenCard = ({ token }: TokenCardProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-200">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
            <div>
              <h3 className="font-medium">{token.symbol}</h3>
              <p className="text-xs text-gray-400">{token.name}</p>
            </div>
          </div>
          <div className={`flex items-center ${
            token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
          }`}>
            {token.priceChange24h >= 0 ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <span className="ml-1 text-sm">
              {Math.abs(token.priceChange24h).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">MC</div>
          <div>${token.marketCap?.toLocaleString()}</div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">Price</div>
          <div>${token.price.toFixed(6)}</div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
            Buy
          </Button>
          <Button variant="outline" className="flex-1">
            Chart
          </Button>
        </div>
      </div>
    </Card>
  );
};
