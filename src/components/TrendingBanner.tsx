import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Memecoin } from "@/types/memecoin";

const TrendingBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: trendingCoins, isLoading } = useQuery({
    queryKey: ['trendingCoins'],
    queryFn: async () => {
      console.log('Fetching trending coins data');
      // For now, returning mock data - this would be replaced with actual API call
      return [
        {
          name: "Trending Coin 1",
          symbol: "TC1",
          marketCap: 1500000,
          socialScore: 95,
          riskScore: 2,
          meta: ["trending", "new"],
        },
        {
          name: "Trending Coin 2",
          symbol: "TC2",
          marketCap: 2000000,
          socialScore: 88,
          riskScore: 3,
          meta: ["viral", "pepe"],
        },
      ] as Memecoin[];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  useEffect(() => {
    if (trendingCoins && trendingCoins.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % trendingCoins.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [trendingCoins]);

  if (isLoading) {
    return (
      <Card className="w-full p-4 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <Skeleton className="h-8 w-full" />
      </Card>
    );
  }

  if (!trendingCoins || trendingCoins.length === 0) {
    return null;
  }

  const currentCoin = trendingCoins[currentIndex];

  return (
    <Card className="w-full p-4 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10 hover:from-crypto-purple/20 hover:to-crypto-cyan/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-crypto-purple" />
          <span className="font-semibold">{currentCoin.name}</span>
          <span className="text-sm text-muted-foreground">({currentCoin.symbol})</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Social Score:</span>
            <span className="font-semibold text-crypto-cyan">{currentCoin.socialScore}%</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <span className="text-sm">Risk:</span>
                  <span className="font-semibold">{currentCoin.riskScore}</span>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk level indicator (1-5)</p>
                <p>Lower is better</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};

export default TrendingBanner;