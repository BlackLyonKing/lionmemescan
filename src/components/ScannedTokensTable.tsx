import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";

interface ScannedToken {
  name: string;
  symbol: string;
  contract: string;
  marketCap: number;
  price: number;
  volume: number;
  holders: number;
  socials: string[];
  graduatedPercent: number;
  creationTime: string;
  timestamp: string;
}

export const ScannedTokensTable = () => {
  const [tokens, setTokens] = useState<ScannedToken[]>([]);
  const { publicKey } = useWallet();
  const { toast } = useToast();

  const handleBuy = async (token: ScannedToken) => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive",
      });
      return;
    }

    // Implement buy functionality
    toast({
      title: "Coming soon",
      description: "Buy functionality will be implemented soon",
      className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Market Cap</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Holders</TableHead>
            <TableHead>Graduated %</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Socials</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.contract}>
              <TableCell>
                <div>
                  <div className="font-medium">{token.name}</div>
                  <div className="text-sm text-muted-foreground">{token.symbol}</div>
                </div>
              </TableCell>
              <TableCell>${token.marketCap.toLocaleString()}</TableCell>
              <TableCell>${token.price.toLocaleString()}</TableCell>
              <TableCell>${token.volume.toLocaleString()}</TableCell>
              <TableCell>{token.holders.toLocaleString()}</TableCell>
              <TableCell>{token.graduatedPercent}%</TableCell>
              <TableCell>{new Date(token.creationTime).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {token.socials.map((social, index) => (
                    <a
                      key={index}
                      href={social}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crypto-purple hover:text-crypto-cyan"
                    >
                      <ExternalLink size={16} />
                    </a>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleBuy(token)}
                  variant="default"
                  className="bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90"
                >
                  Buy
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};