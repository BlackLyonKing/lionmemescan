import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { Card } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TrialStatus = () => {
  const { formattedTime, isTrialActive } = useTrialCountdown();
  const navigate = useNavigate();

  if (!isTrialActive) return null;

  return (
    <Card 
      onClick={() => navigate("/access")} 
      className="fixed top-24 right-4 p-4 cursor-pointer bg-gradient-to-r from-[#ea384c] to-[#d31027] text-white hover:opacity-90 transition-all duration-300 shadow-lg z-50"
    >
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4" />
        <span className="font-medium">Upgrade Now ({formattedTime})</span>
      </div>
    </Card>
  );
};