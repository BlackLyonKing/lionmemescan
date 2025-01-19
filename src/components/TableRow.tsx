import { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TriangleAlert, AlertTriangle } from 'lucide-react';
import { Memecoin } from '@/types/memecoin';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from "@/hooks/use-toast";
import { getRiskColor, getRiskLabel } from '@/utils/riskCalculator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemecoinsTableRowProps {
  coin: Memecoin;
}

export const MemecoinsTableRow = ({ coin }: MemecoinsTableRowProps) => {
  const [amount, setAmount] = useState<string>('');
  const { connected } = useWallet();
  const { toast } = useToast();

  const handleBuy = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount of SOL",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Attempting to buy ${coin.symbol} with ${amount} SOL`);
      toast({
        title: "Purchase initiated",
        description: `Attempting to buy ${coin.symbol} with ${amount} SOL`,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      });
    }
  };

  const riskScoreColor = getRiskColor(coin.riskScore || 1);
  const riskLabel = getRiskLabel(coin.riskScore || 1);

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{coin.name}</div>
          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
        </div>
      </TableCell>
      <TableCell>${coin.marketCap.toLocaleString()}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={`flex items-center gap-2 font-bold ${riskScoreColor}`}>
                {coin.riskScore || 1}
                <AlertTriangle className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2">
                <p className="font-semibold">{riskLabel}</p>
                <ul className="text-sm list-disc list-inside">
                  {coin.whaleStats?.maxHolderPercentage > 15 && (
                    <li>High whale concentration</li>
                  )}
                  {coin.bundledBuys > 2 && (
                    <li>Suspicious buying patterns</li>
                  )}
                  {coin.liquidityStats?.percentageChange24h < -20 && (
                    <li>Significant liquidity decrease</li>
                  )}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
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
      <TableCell>
        <div className="flex items-center gap-1">
          {coin.bundledBuys || 0}
          {coin.bundledBuys > 0 && (
            <TriangleAlert 
              className="h-4 w-4 text-yellow-500" 
              aria-label="This token has bundled buys"
            />
          )}
        </div>
      </TableCell>
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
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="SOL amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24"
            min="0"
            step="0.1"
          />
          <Button
            onClick={handleBuy}
            variant="default"
            className="bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90"
          >
            Buy
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};