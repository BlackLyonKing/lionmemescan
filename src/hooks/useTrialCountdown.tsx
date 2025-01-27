import { useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";

const TRIAL_DURATION = 40 * 60 * 60 * 1000; // 40 hours in milliseconds

export const useTrialCountdown = () => {
  const { publicKey } = useWallet();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setTimeRemaining(null);
      return;
    }

    const trialStart = localStorage.getItem(`trialStartTime_${publicKey.toString()}`);
    if (!trialStart) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - parseInt(trialStart);
      const remaining = Math.max(0, TRIAL_DURATION - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        localStorage.removeItem(`trialStartTime_${publicKey.toString()}`);
        clearInterval(interval);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [publicKey]);

  const startTrial = () => {
    if (!publicKey) return;
    const startTime = Date.now().toString();
    localStorage.setItem(`trialStartTime_${publicKey.toString()}`, startTime);
    setTimeRemaining(TRIAL_DURATION);
  };

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
    startTrial,
  };
};