import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Memecoin } from '@/types/memecoin';

interface MemecoinsTableProps {
  coins: Memecoin[];
}

export const MemecoinsTable = ({ coins }: MemecoinsTableProps) => {
  const [sortField, setSortField] = useState<keyof Memecoin>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedCoins = [...coins].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: keyof Memecoin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="glass-card p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Name</TableHead>
            <TableHead onClick={() => handleSort('marketCap')} className="cursor-pointer">Market Cap</TableHead>
            <TableHead onClick={() => handleSort('threadComments')} className="cursor-pointer">Comments</TableHead>
            <TableHead>DEX Status</TableHead>
            <TableHead>Meta Tags</TableHead>
            <TableHead onClick={() => handleSort('socialScore')} className="cursor-pointer">Social Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCoins.map((coin) => (
            <TableRow key={coin.symbol}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};