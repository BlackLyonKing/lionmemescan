import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Memecoin } from '@/types/memecoin';

interface AIInsightsProps {
  coin: Memecoin;
}

export const AIInsights = ({ coin }: AIInsightsProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeMemecoin = async () => {
    setIsLoading(true);
    try {
      console.log('Requesting AI analysis for:', coin.name);
      
      const { data, error } = await supabase.functions.invoke('analyze-memecoin', {
        body: { memecoinData: coin }
      });

      if (error) throw error;

      console.log('Received AI analysis:', data);
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed this memecoin's potential",
        className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      });
    } catch (error) {
      console.error('Error analyzing memecoin:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete the AI analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button
        onClick={analyzeMemecoin}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Growth Potential"
        )}
      </Button>

      {analysis && (
        <Card className="mt-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis}</p>
        </Card>
      )}
    </div>
  );
};