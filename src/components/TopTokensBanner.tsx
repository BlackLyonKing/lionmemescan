import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction as SolanaTransaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useToast } from "@/components/ui/use-toast";

interface TopToken {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
}

export const TopTokensBanner = () => {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();

  const { data: topTokens, isLoading } = useQuery({
    queryKey: ["topTokens"],
    queryFn: async () => {
      const response = await fetch("https://api.dexscreener.com/latest/dex/tokens/solana");
      const data = await response.json();
      return data.pairs
        .sort((a: any, b: any) => b.priceUsd - a.priceUsd)
        .slice(0, 20)
        .map((pair: any) => ({
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
          price: parseFloat(pair.priceUsd),
          priceChange24h: parseFloat(pair.priceChange24h),
        }));
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleTokenPurchase = async (token: TopToken) => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed",
        variant: "destructive",
      });
      return;
    }

    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const PLATFORM_FEE_PERCENTAGE = 0.5;
      const MIN_SOL_AMOUNT = 0.02;
      
      const solAmount = MIN_SOL_AMOUNT; // Default to minimum amount
      const platformFee = solAmount * (PLATFORM_FEE_PERCENTAGE / 100);
      const platformFeeInLamports = Math.floor(platformFee * LAMPORTS_PER_SOL);

      const transaction = new SolanaTransaction();
      const platformWallet = new PublicKey("3EoyjLFyrMNfuf1FxvQ1Qvxmes7JmopWF4ehu3xp6hnG");

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: platformWallet,
          lamports: platformFeeInLamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      toast({
        title: "Transaction Initiated",
        description: `Transaction sent with signature: ${signature.slice(0, 8)}...`,
      });

    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your transaction",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-48 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden mb-8">
      <div className="flex gap-4 animate-scroll">
        {topTokens?.map((token: TopToken, index: number) => (
          <Card
            key={index}
            className="flex-shrink-0 p-4 cursor-pointer hover:scale-105 transition-transform duration-200 bg-white/5 backdrop-blur-sm"
            onClick={() => handleTokenPurchase(token)}
          >
            <div className="space-y-2">
              <div className="font-semibold">{token.symbol}</div>
              <div className="text-sm text-muted-foreground">{token.name}</div>
              <div className="text-sm">
                ${token.price.toFixed(6)}
                <span
                  className={`ml-2 ${
                    token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {token.priceChange24h >= 0 ? "+" : ""}
                  {token.priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};