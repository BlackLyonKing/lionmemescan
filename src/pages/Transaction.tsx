import { useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Connection, PublicKey, Transaction as SolanaTransaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

const TokenTransaction = () => {
  const { tokenSymbol } = useParams();
  const { connected, publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const PLATFORM_FEE_PERCENTAGE = 0.5;
  const MIN_SOL_AMOUNT = 0.02;

  const handleTransaction = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed",
        variant: "destructive",
      });
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount < MIN_SOL_AMOUNT) {
      toast({
        title: "Invalid amount",
        description: `Minimum transaction amount is ${MIN_SOL_AMOUNT} SOL`,
        variant: "destructive",
      });
      return;
    }

    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto pt-24 px-4">
        <Card className="max-w-md mx-auto p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Purchase {tokenSymbol}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (SOL)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${MIN_SOL_AMOUNT} SOL`}
                min={MIN_SOL_AMOUNT}
                step="0.01"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Platform fee: {PLATFORM_FEE_PERCENTAGE}%
            </div>
            <Button
              onClick={handleTransaction}
              className="w-full bg-gradient-to-r from-crypto-purple to-crypto-cyan"
              disabled={!connected}
            >
              {connected ? "Purchase Token" : "Connect Wallet to Purchase"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TokenTransaction;