import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
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

export const TrialAccessDialog = ({ 
  open, 
  onOpenChange, 
  onAccessGranted 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAccessGranted: () => void;
}) => {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { startTrial } = useTrialCountdown();

  const handleTermsAccept = async () => {
    if (!publicKey) {
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
      const { data: existingTrials, error: trialError } = await supabase
        .from('trial_attempts')
        .select()
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
        .insert([{ 
          wallet_address: publicKey.toString(),
          ip_address: await fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip)
        }]);

      if (insertError) throw insertError;

      startTrial();
      onAccessGranted();
      onOpenChange(false);
      
      toast({
        title: "Trial Activated",
        description: "Your 40-hour Kings tier trial has been activated!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
          <DialogDescription>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-muted p-6">
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
          <Button onClick={handleTermsAccept} disabled={!acceptedTerms}>
            Start Free Trial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};