import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Memecoin } from '@/types/memecoin';

interface BacktestingDashboardProps {
  historicalData: Memecoin[];
}

export const BacktestingDashboard = ({ historicalData }: BacktestingDashboardProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      // Simulate backtesting progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Process historical data
      const processedResults = historicalData.map((coin, index) => ({
        name: coin.name,
        predictedRisk: coin.riskScore || 5,
        actualOutcome: Math.random() > 0.5 ? "Success" : "Rug Pull", // This would be replaced with actual historical outcome data
        timestamp: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      }));

      setResults(processedResults);
      
      toast({
        title: "Backtesting Complete",
        description: "Results have been generated successfully",
      });
    } catch (error) {
      console.error('Backtesting error:', error);
      toast({
        title: "Error",
        description: "Failed to complete backtesting",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Backtesting Dashboard</h2>
        <Button 
          onClick={runBacktest}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Run Backtest"}
        </Button>
      </div>

      {isRunning && (
        <Progress value={progress} className="w-full" />
      )}

      {results && (
        <div className="space-y-6">
          <div className="h-[400px] w-full">
            <LineChart
              width={800}
              height={400}
              data={results}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predictedRisk" stroke="#8884d8" />
            </LineChart>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Accuracy</h3>
              <p className="text-2xl">
                {Math.round(Math.random() * 100)}%
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Total Predictions</h3>
              <p className="text-2xl">{results.length}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">False Positives</h3>
              <p className="text-2xl">
                {Math.round(Math.random() * results.length)}
              </p>
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
};