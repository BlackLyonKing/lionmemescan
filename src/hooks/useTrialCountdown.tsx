import { useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const TRIAL_DURATION = 40 * 60 * 60 * 1000; // 40 hours in milliseconds

export const useTrialCountdown = () => {
  const { disconnect } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const trialStart = localStorage.getItem('trialStartTime');
    
    if (!trialStart) {
      // Start new trial
      const startTime = Date.now();
      localStorage.setItem('trialStartTime', startTime.toString());
      setTimeRemaining(TRIAL_DURATION);
    } else {
      // Calculate remaining time
      const elapsed = Date.now() - parseInt(trialStart);
      const remaining = Math.max(0, TRIAL_DURATION - elapsed);
      setTimeRemaining(remaining);
    }

    const interval = setInterval(() => {
      const trialStartTime = localStorage.getItem('trialStartTime');
      if (trialStartTime) {
        const elapsed = Date.now() - parseInt(trialStartTime);
        const remaining = Math.max(0, TRIAL_DURATION - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Trial expired
          localStorage.removeItem('trialStartTime');
          disconnect();
          toast({
            title: "Trial Expired",
            description: "Your free trial has ended. Please upgrade to continue using our services.",
          });
          navigate('/');
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [disconnect, navigate, toast]);

  const formatTimeRemaining = () => {
    if (timeRemaining === null) return '';
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return {
    timeRemaining,
    formattedTime: formatTimeRemaining(),
    isTrialActive: timeRemaining !== null && timeRemaining > 0,
  };
};