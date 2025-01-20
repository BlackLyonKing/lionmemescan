import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { runBacktest } from '@/utils/backtesting';
import { Memecoin } from '@/types/memecoin';

interface BacktestingDashboardProps {
  historicalData: Memecoin[];
}

export const BacktestingDashboard = ({ historicalData }: BacktestingDashboardProps) => {
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      const backtestResults = await runBacktest(historicalData, {
        start: Date.now() - (30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: Date.now()
      });
      
      setResults(backtestResults);
      setProgress(100);
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Backtesting Dashboard</h2>
        <Button 
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="bg-gradient-to-r from-crypto-purple to-crypto-cyan"
        >
          {isRunning ? 'Running...' : 'Run Backtest'}
        </Button>
      </div>

      {isRunning && (
        <Progress value={progress} className="w-full" />
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="h-[400px] w-full">
            <LineChart
              width={800}
              height={400}
              data={results}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8884d8" 
                name="Prediction Accuracy (%)"
              />
              <Line 
                type="monotone" 
                dataKey="predictedRisk" 
                stroke="#82ca9d" 
                name="Risk Score"
              />
            </LineChart>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Overall Accuracy</h3>
              <p className="text-2xl font-bold text-crypto-purple">
                {results[results.length - 1]?.accuracy.toFixed(2)}%
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Total Predictions</h3>
              <p className="text-2xl font-bold text-crypto-cyan">
                {results.length}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">False Positives</h3>
              <p className="text-2xl font-bold text-red-500">
                {results.filter(r => r.predictedRisk > 7 && r.actualOutcome === 'legitimate').length}
              </p>
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
};