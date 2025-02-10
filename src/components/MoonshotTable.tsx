
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const MoonshotTable = () => {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['moonshot-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moonshot_predictions')
        .select(`
          *,
          pump_tokens (
            name,
            symbol,
            price,
            market_cap
          )
        `)
        .order('prediction_score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading predictions...</div>;
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Target Price</TableHead>
            <TableHead>Timeframe</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions?.map((prediction) => (
            <TableRow key={prediction.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{prediction.pump_tokens.name}</span>
                  <span className="text-muted-foreground">${prediction.pump_tokens.symbol}</span>
                </div>
              </TableCell>
              <TableCell>${prediction.pump_tokens.price.toFixed(6)}</TableCell>
              <TableCell>${prediction.predicted_price.toFixed(6)}</TableCell>
              <TableCell>{prediction.timeframe}</TableCell>
              <TableCell>{prediction.prediction_score}/100</TableCell>
              <TableCell>{prediction.prediction_reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
