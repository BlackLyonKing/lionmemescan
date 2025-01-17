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
import { AlertTriangle } from 'lucide-react';

interface FiltersProps {
  filters: {
    name: string;
    dexStatus: string;
    minMarketCap: string;
    maxMarketCap: string;
    minSocialScore: string;
    minBundledBuys: string;
  };
  setFilters: (filters: any) => void;
}

export const TableFilters = ({ filters, setFilters }: FiltersProps) => {
  return (
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
        <label className="text-sm font-medium flex items-center gap-2">
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
  );
};