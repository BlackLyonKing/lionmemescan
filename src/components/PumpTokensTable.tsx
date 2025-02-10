
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
import { formatDistance } from "date-fns";

export const PumpTokensTable = () => {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['pump-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pump_tokens')
        .select('*')
        .order('market_cap', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading tokens...</div>;
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>24h Change</TableHead>
            <TableHead>Market Cap</TableHead>
            <TableHead>Holders</TableHead>
            <TableHead>Social Score</TableHead>
            <TableHead>Launch Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens?.map((token) => (
            <TableRow key={token.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{token.name}</span>
                  <span className="text-muted-foreground">${token.symbol}</span>
                </div>
              </TableCell>
              <TableCell>${token.price.toFixed(6)}</TableCell>
              <TableCell className={token.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                {token.price_change_24h > 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%
              </TableCell>
              <TableCell>${token.market_cap?.toLocaleString()}</TableCell>
              <TableCell>{token.holders?.toLocaleString()}</TableCell>
              <TableCell>{token.social_score}</TableCell>
              <TableCell>
                {token.launch_date && formatDistance(new Date(token.launch_date), new Date(), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
