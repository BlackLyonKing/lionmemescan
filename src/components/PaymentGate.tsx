import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { supabase } from "@/integrations/supabase/client";
import { useSolanaPrice } from "@/hooks/useSolanaPrice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const RECIPIENT_ADDRESS = "3EoyjLFyrMNfuf1FxvQ1Qvxmes7JmopWF4ehu3xp6hnG";
const ACCESS_DURATION = {
  TRIAL: 40 * 60 * 60 * 1000, // 40 hours in milliseconds
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
      "Full Kings tier access for 40 hours",
      "Advanced memecoin scanning",
      "Real-time social metrics",
      "AI-powered analysis",
      "Priority support"
    ],
    duration: ACCESS_DURATION.TRIAL,
  },
  {
    name: "Basic",
    price: 0.1, // Will be calculated based on $25 equivalent
    features: [
      "Advanced memecoin scanning",
      "Full social metrics analysis",
      "Early trend detection",
      "Basic risk assessment"
    ],
    duration: ACCESS_DURATION.PAID,
  },
  {
    name: "Kings",
    price: 0.5, // Will be calculated based on $150 equivalent
    features: [
      "Premium memecoin scanning",
      "Real-time social metrics",
      "Instant trend alerts",
      "Advanced risk assessment",
      "Priority support",
      "AI-powered insights"
    ],
    duration: ACCESS_DURATION.PAID,
  },
];

export const PaymentGate = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const { publicKey, sendTransaction, signMessage } = useWallet();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasValidAccess, setHasValidAccess] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const { data: solPrice } = useSolanaPrice();
  const { isTrialActive, startTrial } = useTrialCountdown();
  const [showTrialConfirmation, setShowTrialConfirmation] = useState(false);

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

  const requestBalancePermission = async () => {
    if (!publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    try {
      const message = new TextEncoder().encode(
        `Allow Memecoin Scanner to check your wallet balance?\n\nThis permission is required to verify you have sufficient funds for the purchase.\n\nTimestamp: ${Date.now()}`
      );
      await signMessage(message);
      return true;
    } catch (error) {
      console.error("Permission denied for balance check:", error);
      return false;
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!publicKey || !selectedTier) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log("Processing payment for tier:", selectedTier.name);

      // Request permission to check balance
      const hasPermission = await requestBalancePermission();
      if (!hasPermission) {
        throw new Error("Permission denied to check wallet balance");
      }

      // Initialize connection with fallback RPC endpoints
      const rpcEndpoints = [
        "https://api.mainnet-beta.solana.com",
        "https://solana-api.projectserum.com",
        "https://rpc.ankr.com/solana",
        "https://solana.public-rpc.com"
      ];

      let connection: Connection | null = null;
      let blockHash: string | null = null;

      // Try each RPC endpoint until one works
      for (const endpoint of rpcEndpoints) {
        try {
          console.log("Attempting to connect to RPC endpoint:", endpoint);
          const tempConnection = new Connection(endpoint, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000,
          });

          // Test the connection by getting the latest blockhash
          const { blockhash } = await tempConnection.getLatestBlockhash('finalized');
          blockHash = blockhash;
          connection = tempConnection;
          console.log("Successfully connected to RPC endpoint:", endpoint);
          break;
        } catch (error) {
          console.error(`Failed to connect to ${endpoint}:`, error);
          continue;
        }
      }

      if (!connection || !blockHash) {
        throw new Error("Failed to connect to any RPC endpoint");
      }

      // Validate recipient address
      let recipientPubKey: PublicKey;
      try {
        recipientPubKey = new PublicKey(RECIPIENT_ADDRESS);
        console.log("Valid recipient address:", recipientPubKey.toString());
      } catch (error) {
        console.error("Invalid recipient address:", error);
        throw new Error("Invalid recipient address configuration");
      }

      // Calculate payment amount in lamports
      const lamports = Math.floor(LAMPORTS_PER_SOL * selectedTier.price);
      console.log("Payment amount in lamports:", lamports);

      try {
        // Check if user has enough balance
        const balance = await connection.getBalance(publicKey);
        console.log("User balance:", balance / LAMPORTS_PER_SOL, "SOL");
        
        if (balance < lamports) {
          throw new Error(`Insufficient balance. You need ${selectedTier.price} SOL to purchase this tier.`);
        }
      } catch (error) {
        console.error("Error checking balance:", error);
        throw new Error("Unable to check wallet balance. Please try again.");
      }

      // Create and send transaction with retry logic
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Transaction attempt ${attempt}/${maxRetries}`);

          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipientPubKey,
              lamports,
            })
          );

          transaction.recentBlockhash = blockHash;
          transaction.feePayer = publicKey;

          console.log("Sending transaction...");
          const signature = await sendTransaction(transaction, connection);
          console.log("Transaction sent:", signature);

          const confirmation = await connection.confirmTransaction({
            signature,
            blockhash: blockHash,
            lastValidBlockHeight: await connection.getBlockHeight(),
          });
          
          console.log("Transaction confirmation:", confirmation);

          if (confirmation.value.err) {
            throw new Error(`Transaction failed to confirm: ${confirmation.value.err}`);
          }

          // Transaction successful, break the retry loop
          const paymentTime = Date.now();
          localStorage.setItem(
            `lastPayment_${publicKey.toString()}`,
            JSON.stringify({ timestamp: paymentTime, duration: selectedTier.duration })
          );
          
          toast({
            title: "Payment Successful",
            description: `You now have access to ${selectedTier.name} features!`,
          });
          
          setHasValidAccess(true);
          onPaymentSuccess();
          return;

        } catch (error) {
          console.error(`Transaction attempt ${attempt} failed:`, error);
          lastError = error as Error;
          
          if (attempt === maxRetries) {
            throw new Error(`Transaction failed after ${maxRetries} attempts: ${lastError.message}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowPaymentConfirmation(false);
    }
  };

  const handleTrialConfirmation = async () => {
    if (!publicKey) return;
    
    try {
      // Create a dummy transaction to show the confirmation dialog
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0, // Zero SOL transfer
        })
      );

      // This will trigger the wallet confirmation dialog
      const signature = await sendTransaction(transaction, connection);
      console.log("Trial confirmation transaction:", signature);

      // After confirmation, start the trial
      const { data: existingTrials, error: trialError } = await supabase
        .from('trial_attempts')
        .select('*')
        .eq('wallet_address', publicKey.toString());

      if (trialError) throw trialError;

      if (existingTrials && existingTrials.length > 0) {
        toast({
          title: "Trial Not Available",
          description: "You have already used your free trial",
          variant: "destructive",
        });
        return;
      }

      // Record the trial attempt
      const { error: insertError } = await supabase
        .from('trial_attempts')
        .insert([
          { 
            wallet_address: publicKey.toString(),
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip)
          }
        ]);

      if (insertError) throw insertError;

      startTrial();
      const paymentTime = Date.now();
      localStorage.setItem(
        `lastPayment_${publicKey.toString()}`,
        JSON.stringify({ timestamp: paymentTime, duration: ACCESS_DURATION.TRIAL })
      );
      
      toast({
        title: "Trial Activated",
        description: "Your 40-hour Kings tier trial has been activated!",
      });
      
      setHasValidAccess(true);
      onPaymentSuccess();
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Could not start trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowTrialConfirmation(false);
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
      setShowTrialConfirmation(true);
      return;
    }

    setSelectedTier(tier);
    setShowPaymentConfirmation(true);
  };

  if (hasValidAccess) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {isTrialActive ? (
        <div className="text-center mb-8">
          <p className="text-xl text-yellow-400">
            You are currently on a free trial. Upgrade to continue accessing all features after your trial expires.
          </p>
        </div>
      ) : null}

      <Dialog open={showPaymentConfirmation} onOpenChange={setShowPaymentConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are about to pay {selectedTier?.price} SOL for the {selectedTier?.name} tier.
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>You will have access to all features for 30 days</li>
                <li>Payment is non-refundable</li>
                <li>Your wallet will be charged {selectedTier?.price} SOL (~${(selectedTier?.price || 0 * solPrice).toFixed(2)} USD)</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentConfirmation} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrialConfirmation} onOpenChange={setShowTrialConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Free Trial</DialogTitle>
            <DialogDescription>
              By starting the free trial, you acknowledge that:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>You will have access to all Kings tier features for 40 hours</li>
                <li>Your wallet will be automatically disconnected after the trial period ends</li>
                <li>You can only use one free trial per wallet address</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrialConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrialConfirmation}>
              Confirm Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    (~${(tier.price * solPrice).toFixed(2)} USD)
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
