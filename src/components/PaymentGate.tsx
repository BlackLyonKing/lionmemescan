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
import { Checkbox } from "@/components/ui/checkbox";

const TERMS_AND_CONDITIONS = `
By accepting these terms, you acknowledge and agree to the following:

1. This is a trial version of our premium service.
2. The trial period lasts for 40 hours from activation.
3. We may collect and analyze usage data to improve our services.
4. You are responsible for any actions taken through your wallet during the trial.
5. We reserve the right to terminate the trial at any time.
6. After the trial period ends, you'll need to purchase a subscription to continue accessing premium features.
7. This agreement is governed by applicable laws and regulations.
`;

export const PaymentGate = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const { publicKey, signMessage } = useWallet();
  const { toast } = useToast();
  const [hasValidAccess, setHasValidAccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'basic' | 'kings'>('free');
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { startTrial } = useTrialCountdown();

  useEffect(() => {
    checkAccess();
  }, [publicKey]);

  const checkAccess = async () => {
    if (!publicKey) return;
    console.log("Checking access for wallet:", publicKey.toString());

    const lastPaymentData = localStorage.getItem(`lastPayment_${publicKey.toString()}`);
    if (lastPaymentData) {
      const { timestamp, duration } = JSON.parse(lastPaymentData);
      const currentTime = Date.now();
      const isValid = currentTime - timestamp < duration;
      
      if (isValid) {
        console.log("Valid access found, granting access");
        setHasValidAccess(true);
        onPaymentSuccess();
      } else {
        console.log("No valid access found, showing dialog");
        setShowDialog(true);
      }
    } else {
      console.log("No payment data found, showing dialog");
      setShowDialog(true);
    }
  };

  const handleTierSelection = (tier: 'free' | 'basic' | 'kings') => {
    setSelectedTier(tier);
    setShowTerms(true);
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

    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting trial confirmation process");
      if (selectedTier === 'free') {
        const message = new TextEncoder().encode(
          `I confirm that I want to start my 40-hour Kings tier trial and I accept the Terms and Conditions.\n\nTerms Version: 1.0\nTimestamp: ${Date.now()}`
        );
        await signMessage(message);

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
        localStorage.setItem(
          `lastPayment_${publicKey.toString()}`,
          JSON.stringify({ 
            timestamp: Date.now(), 
            duration: 40 * 60 * 60 * 1000 // 40 hours in milliseconds
          })
        );
        
        console.log("Trial activated successfully");
        setHasValidAccess(true);
        onPaymentSuccess();
        setShowDialog(false);
        
        toast({
          title: "Trial Activated",
          description: "Your 40-hour Kings tier trial has been activated!",
        });
      } else {
        toast({
          title: "Payment Required",
          description: `Please proceed with payment for the ${selectedTier} tier`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (hasValidAccess) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">Choose Your Access Tier</DialogTitle>
          <DialogDescription className="space-y-6">
            {!showTerms ? (
              <div className="grid gap-6">
                <Button 
                  variant="outline" 
                  className={`w-full p-6 flex flex-col items-start space-y-3 ${
                    selectedTier === 'free' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTierSelection('free')}
                >
                  <div className="font-bold text-lg">Free Trial</div>
                  <div className="text-sm text-muted-foreground text-left space-y-1">
                    <p>• 40 hours of Kings tier access</p>
                    <p>• Full feature access</p>
                    <p>• No payment required</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className={`w-full p-6 flex flex-col items-start space-y-3 ${
                    selectedTier === 'basic' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTierSelection('basic')}
                >
                  <div className="font-bold text-lg">Basic Tier - 0.1 SOL/month</div>
                  <div className="text-sm text-muted-foreground text-left space-y-1">
                    <p>• Basic memecoin scanning</p>
                    <p>• Standard metrics</p>
                    <p>• Email support</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className={`w-full p-6 flex flex-col items-start space-y-3 ${
                    selectedTier === 'kings' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTierSelection('kings')}
                >
                  <div className="font-bold text-lg">Kings Tier - 0.2 SOL/month</div>
                  <div className="text-sm text-muted-foreground text-left space-y-1">
                    <p>• Advanced memecoin scanning</p>
                    <p>• Real-time social metrics</p>
                    <p>• AI-powered analysis</p>
                    <p>• Priority support</p>
                  </div>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-6">
                  <pre className="text-sm whitespace-pre-wrap leading-relaxed">{TERMS_AND_CONDITIONS}</pre>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I accept the terms and conditions
                  </label>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          {showTerms ? (
            <div className="flex w-full gap-4">
              <Button 
                variant="outline"
                onClick={() => setShowTerms(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleTrialConfirmation}
                disabled={!acceptedTerms}
                className="flex-1"
              >
                {selectedTier === 'free' ? 'Start Free Trial' : 'Continue to Payment'}
              </Button>
            </div>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};