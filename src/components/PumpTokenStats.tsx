
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, LineChart } from "lucide-react";

export const PumpTokenStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['pump-token-stats'],
    queryFn: async () => {
      const { data: tokens } = await supabase
        .from('pump_tokens')
        .select('*');
      
      if (!tokens) return null;

      const totalTokens = tokens.length;
      const totalHolders = tokens.reduce((acc, token) => acc + (token.holders || 0), 0);
      const averageScore = tokens.reduce((acc, token) => acc + (token.social_score || 0), 0) / totalTokens;

      return {
        totalTokens,
        totalHolders,
        averageScore
      };
    }
  });

  if (isLoading || !stats) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-crypto-purple/20">
            <TrendingUp className="h-6 w-6 text-crypto-purple" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <h3 className="text-2xl font-bold">{stats.totalTokens}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-crypto-cyan/20">
            <Users className="h-6 w-6 text-crypto-cyan" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Holders</p>
            <h3 className="text-2xl font-bold">{stats.totalHolders.toLocaleString()}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-yellow-500/20">
            <LineChart className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <h3 className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

