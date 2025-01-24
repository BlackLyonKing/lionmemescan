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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
        setShowDialog(true);
      }
    } else {
      setShowDialog(true);
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

    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedTier === 'free') {
        // Request wallet signature to confirm trial and accept terms
        const message = new TextEncoder().encode(
          `I confirm that I want to start my 40-hour Kings tier trial and I accept the Terms and Conditions.\n\nTerms Version: 1.0\nTimestamp: ${Date.now()}`
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
        localStorage.setItem(
          `lastPayment_${publicKey.toString()}`,
          JSON.stringify({ 
            timestamp: Date.now(), 
            duration: 40 * 60 * 60 * 1000 // 40 hours in milliseconds
          })
        );
        
        toast({
          title: "Trial Activated",
          description: "Your 40-hour Kings tier trial has been activated!",
        });
        
        setHasValidAccess(true);
        onPaymentSuccess();
      } else {
        // Handle paid tiers (Basic and Kings)
        toast({
          title: "Payment Required",
          description: `Please proceed with payment for the ${selectedTier} tier`,
        });
        // Payment processing logic would go here
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setShowDialog(false);
  };

  if (hasValidAccess) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Access Tier</DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="grid gap-4">
              <Button 
                variant="outline" 
                className={`w-full p-6 flex flex-col items-start space-y-2 ${
                  selectedTier === 'free' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTier('free')}
              >
                <div className="font-bold">Free Trial</div>
                <div className="text-sm text-muted-foreground text-left">
                  • 40 hours of Kings tier access
                  <br />• Full feature access
                  <br />• No payment required
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className={`w-full p-6 flex flex-col items-start space-y-2 ${
                  selectedTier === 'basic' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTier('basic')}
              >
                <div className="font-bold">Basic Tier - 0.1 SOL/month</div>
                <div className="text-sm text-muted-foreground text-left">
                  • Basic memecoin scanning
                  <br />• Standard metrics
                  <br />• Email support
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className={`w-full p-6 flex flex-col items-start space-y-2 ${
                  selectedTier === 'kings' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTier('kings')}
              >
                <div className="font-bold">Kings Tier - 0.2 SOL/month</div>
                <div className="text-sm text-muted-foreground text-left">
                  • Advanced memecoin scanning
                  <br />• Real-time social metrics
                  <br />• AI-powered analysis
                  <br />• Priority support
                </div>
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <pre className="text-sm whitespace-pre-wrap">{TERMS_AND_CONDITIONS}</pre>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the terms and conditions
                </label>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={handleTrialConfirmation}
            disabled={selectedTier === 'free' && !acceptedTerms}
          >
            {selectedTier === 'free' ? 'Start Free Trial' : 'Continue to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};