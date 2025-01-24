import { useState } from 'react';
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Memecoin } from '@/types/memecoin';
import { TableFilters } from './TableFilters';
import { MemecoinsTableHeader } from './TableHeader';
import { MemecoinsTableRow } from './TableRow';
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { useSolanaPrice } from "@/hooks/useSolanaPrice";

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
  const { publicKey } = useWallet();
  const { toast } = useToast();

  // Check if user has Basic tier
  const isBasicTier = localStorage.getItem(`lastPayment_${publicKey?.toString()}`)?.includes('"price":0.1');

  const handleSort = (field: keyof Memecoin) => {
    if (isBasicTier) {
      toast({
        title: "Feature not available",
        description: "Sorting is only available in Free and King tiers",
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
      return;
    }
    
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Only filter out tokens with scam history
  const safeCoins = coins.filter(coin => 
    !coin.creatorRisk?.previousScams
  );

  const { data: solanaPrice } = useSolanaPrice();
  const kingsPrice = solanaPrice ? (100 / solanaPrice).toFixed(2) : 0.2;

  const filteredCoins = isBasicTier ? safeCoins : safeCoins.filter(coin => {
    const nameMatch = coin.name.toLowerCase().includes(filters.name.toLowerCase()) ||
                     coin.symbol.toLowerCase().includes(filters.name.toLowerCase());
    const dexStatusMatch = filters.dexStatus === 'all' || coin.dexStatus === filters.dexStatus;
    const marketCapMatch = (!filters.minMarketCap || coin.marketCap >= Number(filters.minMarketCap)) &&
                         (!filters.maxMarketCap || coin.marketCap <= Number(filters.maxMarketCap));
    const socialScoreMatch = !filters.minSocialScore || coin.socialScore >= Number(filters.minSocialScore);
    const bundledBuysMatch = !filters.minBundledBuys || (coin.bundledBuys || 0) >= Number(filters.minBundledBuys);

    return nameMatch && dexStatusMatch && marketCapMatch && socialScoreMatch && bundledBuysMatch;
  });

  const sortedCoins = isBasicTier ? filteredCoins : [...filteredCoins].sort((a, b) => {
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
    <div className="space-y-4 pb-20">
      {!isBasicTier && <TableFilters filters={filters} setFilters={setFilters} />}
      
      <div className="glass-card p-4">
        <Table>
          <MemecoinsTableHeader onSort={handleSort} />
          <TableBody>
            {sortedCoins.map((coin) => (
              <MemecoinsTableRow key={coin.symbol} coin={coin} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4">
        <div className="container mx-auto flex justify-between items-center">
          <a 
            href="/terms" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms & Use
          </a>
          <span className="text-sm text-muted-foreground">
            Kings Tier: {kingsPrice} SOL (≈ $100)
          </span>
        </div>
      </div>
    </div>
  );
};
