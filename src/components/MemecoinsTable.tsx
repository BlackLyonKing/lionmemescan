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
import { ExternalLink, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemecoinsTableProps {
  coins: Memecoin[];
}

export const MemecoinsTable = ({ coins }: MemecoinsTableProps) => {
  const [sortField, setSortField] = useState<keyof Memecoin>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    name: '',
    dexStatus: 'all',
    minMarketCap: '',
    maxMarketCap: '',
    minSocialScore: '',
    minBundledBuys: '',
  });

  const handleSort = (field: keyof Memecoin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // First filter out any tokens with scam history
  const safeCoins = coins.filter(coin => !coin.creatorRisk?.previousScams);

  const filteredCoins = safeCoins.filter(coin => {
    const nameMatch = coin.name.toLowerCase().includes(filters.name.toLowerCase()) ||
                     coin.symbol.toLowerCase().includes(filters.name.toLowerCase());
    const dexStatusMatch = filters.dexStatus === 'all' || coin.dexStatus === filters.dexStatus;
    const marketCapMatch = (!filters.minMarketCap || coin.marketCap >= Number(filters.minMarketCap)) &&
                         (!filters.maxMarketCap || coin.marketCap <= Number(filters.maxMarketCap));
    const socialScoreMatch = !filters.minSocialScore || coin.socialScore >= Number(filters.minSocialScore);
    const bundledBuysMatch = !filters.minBundledBuys || (coin.bundledBuys || 0) >= Number(filters.minBundledBuys);

    return nameMatch && dexStatusMatch && marketCapMatch && socialScoreMatch && bundledBuysMatch;
  });

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="Search by name or symbol"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">DEX Status</label>
          <Select
            value={filters.dexStatus}
            onValueChange={(value) => setFilters({ ...filters, dexStatus: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Market Cap Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minMarketCap}
              onChange={(e) => setFilters({ ...filters, minMarketCap: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxMarketCap}
              onChange={(e) => setFilters({ ...filters, maxMarketCap: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Min Social Score</label>
          <Input
            type="number"
            placeholder="Minimum score"
            value={filters.minSocialScore}
            onChange={(e) => setFilters({ ...filters, minSocialScore: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            Min Bundled Buys
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Higher number of bundled buys may indicate suspicious trading activity</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <Input
            type="number"
            placeholder="Min bundled buys"
            value={filters.minBundledBuys}
            onChange={(e) => setFilters({ ...filters, minBundledBuys: e.target.value })}
          />
        </div>
      </div>

      <div className="glass-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-primary">
                Name <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </TableHead>
              <TableHead onClick={() => handleSort('marketCap')} className="cursor-pointer hover:text-primary">
                Market Cap <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </TableHead>
              <TableHead onClick={() => handleSort('threadComments')} className="cursor-pointer hover:text-primary">
                Comments <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </TableHead>
              <TableHead>DEX Status</TableHead>
              <TableHead>Meta Tags</TableHead>
              <TableHead onClick={() => handleSort('socialScore')} className="cursor-pointer hover:text-primary">
                Social Score <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </TableHead>
              <TableHead onClick={() => handleSort('bundledBuys')} className="cursor-pointer hover:text-primary">
                Bundled Buys <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </TableHead>
              <TableHead>Token Page</TableHead>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};