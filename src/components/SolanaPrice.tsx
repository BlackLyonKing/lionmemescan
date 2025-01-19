import { useSolanaPrice } from "@/hooks/useSolanaPrice";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export const SolanaPrice = () => {
  const { data: price, isLoading, error } = useSolanaPrice();

  if (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/solana-logo.png"
            alt="Solana"
            className="w-6 h-6"
            onError={(e) => {
              e.currentTarget.src = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
            }}
          />
          <span className="font-medium text-sm">SOL/USD</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold">${price?.toFixed(2)}</span>
            {/* Add price change indicator here when we implement price change tracking */}
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
    </Card>
  );
};