
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Rocket, TrendingUp, AlertTriangle } from "lucide-react";

export const MoonshotMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['moonshot-metrics'],
    queryFn: async () => {
      const { data: predictions } = await supabase
        .from('moonshot_predictions')
        .select(`
          *,
          pump_tokens!inner (
            price,
            market_cap,
            holders
          )
        `);
      
      if (!predictions) return null;

      const totalPredictions = predictions.length;
      const averageScore = predictions.reduce((acc, p) => acc + p.prediction_score, 0) / totalPredictions;
      const totalValue = predictions.reduce((acc, p) => acc + (p.pump_tokens.market_cap || 0), 0);

      return {
        totalPredictions,
        averageScore,
        totalValue
      };
    }
  });

  if (isLoading || !metrics) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-crypto-purple/20">
            <Rocket className="h-6 w-6 text-crypto-purple" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Predictions</p>
            <h3 className="text-2xl font-bold">{metrics.totalPredictions}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-crypto-cyan/20">
            <TrendingUp className="h-6 w-6 text-crypto-cyan" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <h3 className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}/100</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-crypto-purple/10 to-crypto-cyan/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-yellow-500/20">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <h3 className="text-2xl font-bold">${(metrics.totalValue / 1000000).toFixed(2)}M</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

