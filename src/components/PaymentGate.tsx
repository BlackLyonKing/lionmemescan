import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

const PAYMENT_AMOUNT = 0.1; // 0.1 SOL
const RECIPIENT_ADDRESS = "YOUR_WALLET_ADDRESS"; // Replace with your wallet address
const ACCESS_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const PaymentGate = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasValidAccess, setHasValidAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [publicKey]);

  const checkAccess = () => {
    if (!publicKey) return;

    const lastPaymentData = localStorage.getItem(`lastPayment_${publicKey.toString()}`);
    if (lastPaymentData) {
      const lastPaymentTime = parseInt(lastPaymentData);
      const currentTime = Date.now();
      const isValid = currentTime - lastPaymentTime < ACCESS_DURATION;
      
      console.log("Checking access:", {
        lastPaymentTime,
        currentTime,
        timeDiff: currentTime - lastPaymentTime,
        accessDuration: ACCESS_DURATION,
        isValid
      });

      if (isValid) {
        setHasValidAccess(true);
        onPaymentSuccess();
      }
    }
  };

  const handlePayment = async () => {
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Initiating payment process");

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const recipientPubKey = new PublicKey(RECIPIENT_ADDRESS);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: LAMPORTS_PER_SOL * PAYMENT_AMOUNT,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed:", confirmation);

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      // Store payment timestamp in localStorage
      const paymentTime = Date.now();
      localStorage.setItem(`lastPayment_${publicKey.toString()}`, paymentTime.toString());
      
      toast({
        title: "Payment Successful",
        description: "You now have access to the bot for 30 days!",
      });
      
      setHasValidAccess(true);
      onPaymentSuccess();

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasValidAccess) {
    return null;
  }

  return (
    <div className="gradient-border max-w-md mx-auto">
      <div className="glass-card p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Access Required
          </h2>
          <p className="text-lg text-white/80">
            Get 30 Days Access to Premium Features
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-black/20 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-white">What you'll get:</h3>
            <ul className="list-disc list-inside space-y-1 text-white/80">
              <li>Real-time memecoin scanning</li>
              <li>Advanced social metrics analysis</li>
              <li>Early detection of trending coins</li>
              <li>Risk assessment tools</li>
            </ul>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xl font-bold text-white">
              One-time payment: {PAYMENT_AMOUNT} SOL
            </p>
            <p className="text-sm text-white/60">
              (~${(PAYMENT_AMOUNT * 100).toFixed(2)} USD)
            </p>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
        >
          {isProcessing ? "Processing..." : `Pay ${PAYMENT_AMOUNT} SOL`}
        </Button>

        <p className="text-sm text-center text-white/60">
          Your access will be activated immediately after payment
        </p>
      </div>
    </div>
  );
};