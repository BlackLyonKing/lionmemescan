import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { Memecoin } from '@/types/memecoin';

interface MemecoinsTableRowProps {
  coin: Memecoin;
}

export const MemecoinsTableRow = ({ coin }: MemecoinsTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{coin.name}</div>
          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
        </div>
      </TableCell>
      <TableCell>${coin.marketCap.toLocaleString()}</TableCell>
      <TableCell>{coin.threadComments}</TableCell>
      <TableCell>
        <Badge variant={coin.dexStatus === 'paid' ? 'default' : 'destructive'}>
          {coin.dexStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {coin.meta.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-gradient-to-r from-crypto-purple to-crypto-cyan h-full rounded-full"
            style={{ width: `${coin.socialScore}%` }}
          />
        </div>
      </TableCell>
      <TableCell>{coin.bundledBuys || 0}</TableCell>
      <TableCell>
        {coin.threadUrl && (
          <a
            href={coin.threadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-crypto-purple hover:text-crypto-cyan transition-colors"
          >
            View <ExternalLink size={16} />
          </a>
        )}
      </TableCell>
    </TableRow>
  );
};