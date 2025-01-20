import { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TriangleAlert, AlertTriangle } from 'lucide-react';
import { Memecoin } from '@/types/memecoin';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from "@/hooks/use-toast";
import { getRiskColor, getRiskLabel, calculateRiskScore, getRiskDescription } from '@/utils/riskCalculator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface MemecoinsTableRowProps {
  coin: Memecoin;
}

export const MemecoinsTableRow = ({ coin }: MemecoinsTableRowProps) => {
  const [amount, setAmount] = useState<string>('');
  const { connected, publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const MIN_SOL_AMOUNT = 0.02;
  const PLATFORM_FEE_PERCENTAGE = 0.5; // 0.5%

  const handleBuy = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive",
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
      return;
    }

    const solAmount = parseFloat(amount);
    if (!amount || solAmount < MIN_SOL_AMOUNT) {
      toast({
        title: "Invalid amount",
        description: `Minimum purchase amount is ${MIN_SOL_AMOUNT} SOL`,
        variant: "destructive",
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
      return;
    }

    try {
      console.log(`Initiating purchase of ${coin.symbol} for ${amount} SOL`);
      
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      
      // Calculate platform fee
      const platformFee = solAmount * (PLATFORM_FEE_PERCENTAGE / 100);
      const platformFeeInLamports = Math.floor(platformFee * LAMPORTS_PER_SOL);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add platform fee transfer instruction
      const platformWallet = new PublicKey("YOUR_PLATFORM_WALLET_ADDRESS"); // Replace with your platform's wallet
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: platformWallet,
          lamports: platformFeeInLamports,
        })
      );
      
      // Add token purchase instruction (this would need to be implemented based on your DEX integration)
      // For now, we'll just log the attempt
      console.log(`Platform fee: ${platformFee} SOL`);
      console.log(`Amount after fee: ${solAmount - platformFee} SOL`);

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed:", confirmation);

      toast({
        title: "Purchase initiated",
        description: `Purchasing ${coin.symbol} for ${amount} SOL (including ${PLATFORM_FEE_PERCENTAGE}% platform fee)`,
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
    }
  };

  const riskScore = calculateRiskScore(coin);
  const riskScoreColor = getRiskColor(riskScore);
  const riskLabel = getRiskLabel(riskScore);
  const riskWarnings = getRiskDescription(coin);

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
                {riskScore}
                <AlertTriangle className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <div className="space-y-2">
                <p className="font-semibold">{riskLabel}</p>
                {riskWarnings.length > 0 ? (
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {riskWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No significant risks detected</p>
                )}
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
            placeholder={`Min ${MIN_SOL_AMOUNT} SOL`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24"
            min={MIN_SOL_AMOUNT}
            step="0.01"
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