import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const PaymentGate = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const { publicKey, signMessage } = useWallet();
  const { toast } = useToast();
  const [hasValidAccess, setHasValidAccess] = useState(false);
  const [showTrialConfirmation, setShowTrialConfirmation] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'basic' | 'kings'>('free');
  const { startTrial } = useTrialCountdown();

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
      } else {
        setShowTrialConfirmation(true);
      }
    } else {
      setShowTrialConfirmation(true);
    }
  };

  const handleTrialConfirmation = async () => {
    if (!publicKey || !signMessage) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (selectedTier === 'free') {
      try {
        // Request wallet signature to confirm trial
        const message = new TextEncoder().encode(
          `I confirm that I want to start my 40-hour Kings tier trial.\n\nTimestamp: ${Date.now()}`
        );
        await signMessage(message);

        // Check if user has already used trial
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
          JSON.stringify({ 
            timestamp: paymentTime, 
            duration: 40 * 60 * 60 * 1000 // 40 hours in milliseconds
          })
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
      }
    } else {
      // Handle paid tiers (Basic and Kings)
      // Payment processing logic goes here
      toast({
        title: "Payment Required",
        description: `You have selected the ${selectedTier} tier. Please proceed with the payment.`,
        variant: "default",
      });
      // Implement payment processing logic here
    }
    
    setShowTrialConfirmation(false);
  };

  if (hasValidAccess) {
    return null;
  }

  return (
    <Dialog open={showTrialConfirmation} onOpenChange={setShowTrialConfirmation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Access Tier</DialogTitle>
          <DialogDescription>
            {selectedTier === 'free' ? (
              <>
                Welcome to Memecoin Scanner! You're about to start your free trial which includes:
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>40 hours of Kings tier access</li>
                  <li>Advanced memecoin scanning</li>
                  <li>Real-time social metrics</li>
                  <li>AI-powered analysis</li>
                  <li>Priority support</li>
                </ul>
                <p className="mt-4">
                  By continuing, you acknowledge that your trial will expire after 40 hours of access.
                </p>
              </>
            ) : (
              <>
                Select your preferred tier:
                <div className="space-y-4 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setSelectedTier('basic')}
                  >
                    Basic Tier - 0.1 SOL/month
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setSelectedTier('kings')}
                  >
                    Kings Tier - 0.2 SOL/month
                  </Button>
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          {selectedTier === 'free' ? (
            <>
              <Button variant="outline" onClick={() => setSelectedTier('basic')}>
                View Paid Plans
              </Button>
              <Button onClick={handleTrialConfirmation}>
                Start Free Trial
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setSelectedTier('free')}>
                Try Free Trial
              </Button>
              <Button onClick={handleTrialConfirmation}>
                Continue to Payment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
