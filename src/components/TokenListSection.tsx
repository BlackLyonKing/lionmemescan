
import { Card } from "@/components/ui/card";
import { Star, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TokenData {
  name: string;
  symbol: string;
  icon?: string;
  price: string;
  marketCap: string;
  volume: string;
  change: string;
  createdAt: string;
  twitter?: string;
  telegram?: string;
}

interface TokenListSectionProps {
  title: string;
  tokens: TokenData[];
}

export const TokenListSection = ({ title, tokens }: TokenListSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white/90">{title}</h2>
      <div className="grid gap-4">
        {tokens.map((token, index) => (
          <Card key={index} className="p-4 bg-black/20 border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  {token.icon ? (
                    <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-lg font-bold">{token.symbol[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{token.name}</h3>
                  <p className="text-sm text-white/60">{token.symbol}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-white/5">
                <Star className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-white/60">Price</p>
                <p className="font-medium">{token.price}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Market Cap</p>
                <p className="font-medium">{token.marketCap}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Volume</p>
                <p className="font-medium">{token.volume}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                {token.twitter && (
                  <Button variant="ghost" size="icon" className="hover:bg-white/5">
                    <Twitter className="w-4 h-4" />
                  </Button>
                )}
                {token.telegram && (
                  <Button variant="ghost" size="icon" className="hover:bg-white/5">
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-white/60">
                Created {new Date(token.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
