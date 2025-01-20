import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { Card } from "@/components/ui/card";
import { Timer } from "lucide-react";

export const TrialStatus = () => {
  const { formattedTime, isTrialActive } = useTrialCountdown();

  if (!isTrialActive) return null;

  return (
    <Card className="fixed top-16 right-4 p-4 bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4" />
        <span className="font-medium">Trial remaining: {formattedTime}</span>
      </div>
    </Card>
  );
};