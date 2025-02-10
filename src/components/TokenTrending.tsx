
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export const TokenTrending = () => {
  const { data: trendingTokens, isLoading } = useQuery({
    queryKey: ['trending-tokens'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pump_tokens')
        .select('*')
        .eq('is_trending', true)
        .order('social_score', { ascending: false })
        .limit(5);
      
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading trending tokens...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
      <div className="grid grid-cols-1 gap-4">
        {trendingTokens?.map((token) => (
          <Card key={token.id} className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{token.name}</h3>
                  <p className="text-sm text-muted-foreground">${token.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">${token.price.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <div className={`flex items-center ${token.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.price_change_24h >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    <span>{Math.abs(token.price_change_24h).toFixed(2)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Social Score</p>
                  <p className="font-medium">{token.social_score}/100</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

