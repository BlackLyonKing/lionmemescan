import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

const RECIPIENT_ADDRESS = "YOUR_WALLET_ADDRESS"; // Replace with your wallet address
const ACCESS_DURATION = {
  TRIAL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  PAID: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};

interface PricingTier {
  name: string;
  price: number;
  features: string[];
  duration: number;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free Trial",
    price: 0,
    features: [
      "Basic memecoin scanning",
      "Limited social metrics",
      "Basic trend detection",
    ],
    duration: ACCESS_DURATION.TRIAL,
  },
  {
    name: "Basic",
    price: 0.1,
    features: [
      "Advanced memecoin scanning",
      "Full social metrics analysis",
      "Early trend detection",
      "Basic risk assessment",
    ],
    duration: ACCESS_DURATION.PAID,
  },
  {
    name: "King",
    price: 0.5,
    features: [
      "Premium memecoin scanning",
      "Real-time social metrics",
      "Instant trend alerts",
      "Advanced risk assessment",
      "Priority support",
    ],
    duration: ACCESS_DURATION.PAID,
  },
];

export const PaymentGate = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasValidAccess, setHasValidAccess] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  useEffect(() => {
    checkAccess();
  }, [publicKey]);

  const checkAccess = () => {
    if (!publicKey) return;

    const lastPaymentData = localStorage.getItem(`lastPayment_${publicKey.toString()}`);
    if (lastPaymentData) {
      const { timestamp, duration } = JSON.parse(lastPaymentData);
      const currentTime = Date.now();
      const isValid = currentTime - timestamp < duration;
      
      if (isValid) {
        setHasValidAccess(true);
        onPaymentSuccess();
      }
    }
  };

  const handlePayment = async (tier: PricingTier) => {
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (tier.price === 0) {
      // Handle free trial
      const paymentTime = Date.now();
      localStorage.setItem(
        `lastPayment_${publicKey.toString()}`,
        JSON.stringify({ timestamp: paymentTime, duration: tier.duration })
      );
      toast({
        title: "Trial Activated",
        description: "Your 7-day trial has been activated!",
      });
      setHasValidAccess(true);
      onPaymentSuccess();
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Initiating payment process for tier:", tier.name);

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const recipientPubKey = new PublicKey(RECIPIENT_ADDRESS);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: LAMPORTS_PER_SOL * tier.price,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed:", confirmation);

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      const paymentTime = Date.now();
      localStorage.setItem(
        `lastPayment_${publicKey.toString()}`,
        JSON.stringify({ timestamp: paymentTime, duration: tier.duration })
      );
      
      toast({
        title: "Payment Successful",
        description: `You now have access to ${tier.name} features!`,
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
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-white/80">
          Get access to premium memecoin scanning features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRICING_TIERS.map((tier) => (
          <Card key={tier.name} className="relative p-6 backdrop-blur-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center">{tier.name}</h3>
              <div className="text-center">
                <span className="text-3xl font-bold">
                  {tier.price === 0 ? "Free" : `${tier.price} SOL`}
                </span>
                {tier.price > 0 && (
                  <p className="text-sm text-white/60">
                    (~${(tier.price * 100).toFixed(2)} USD)
                  </p>
                )}
              </div>

              <ul className="space-y-3 my-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(tier)}
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
              >
                {isProcessing
                  ? "Processing..."
                  : tier.price === 0
                  ? "Start Free Trial"
                  : `Pay ${tier.price} SOL`}
              </Button>

              <p className="text-sm text-center text-white/60">
                {tier.price === 0
                  ? "No payment required"
                  : "Instant access after payment"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};