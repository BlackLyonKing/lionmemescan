import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from 'lucide-react';
import { Memecoin } from '@/types/memecoin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TableHeaderProps {
  onSort: (field: keyof Memecoin) => void;
}

export const MemecoinsTableHeader = ({ onSort }: TableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead onClick={() => onSort('name')} className="cursor-pointer hover:text-primary">
          Name <ArrowUpDown className="inline h-4 w-4 ml-1" />
        </TableHead>
        <TableHead onClick={() => onSort('marketCap')} className="cursor-pointer hover:text-primary">
          Market Cap <ArrowUpDown className="inline h-4 w-4 ml-1" />
        </TableHead>
        <TableHead onClick={() => onSort('riskScore')} className="cursor-pointer hover:text-primary">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                Risk Score <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>1-10 scale: 1 (lowest risk) to 10 (highest risk)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableHead>
        <TableHead onClick={() => onSort('threadComments')} className="cursor-pointer hover:text-primary">
          Comments <ArrowUpDown className="inline h-4 w-4 ml-1" />
        </TableHead>
        <TableHead>DEX Status</TableHead>
        <TableHead>Meta Tags</TableHead>
        <TableHead onClick={() => onSort('socialScore')} className="cursor-pointer hover:text-primary">
          Social Score <ArrowUpDown className="inline h-4 w-4 ml-1" />
        </TableHead>
        <TableHead onClick={() => onSort('bundledBuys')} className="cursor-pointer hover:text-primary">
          Bundled Buys <ArrowUpDown className="inline h-4 w-4 ml-1" />
        </TableHead>
        <TableHead>Token Page</TableHead>
      </TableRow>
    </TableHeader>
  );
};