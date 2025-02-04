import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { analyzeToken } from '@/utils/tradingStrategy';
import { SecurityCheckResult } from '@/utils/securityChecks';

interface BacktestResult {
  timestamp: string;
  signal: 'buy' | 'sell' | 'hold';
  actualReturn: number;
  securityChecks: SecurityCheckResult;
}

export const BacktestingDashboard = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BacktestResult[]>([]);

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      const tokens = await fetchHistoricalTokens();
      const totalTokens = tokens.length;
      let processedTokens = 0;
      
      const backtestResults: BacktestResult[] = [];
      
      for (const token of tokens) {
        const analysis = await analyzeToken(token.address);
        if (analysis) {
          backtestResults.push({
            timestamp: new Date().toISOString(),
            signal: analysis.technicalAnalysis.rsi > 70 ? 'sell' : analysis.technicalAnalysis.rsi < 30 ? 'buy' : 'hold',
            actualReturn: calculateActualReturn(token),
            securityChecks: analysis.securityCheck
          });
        }
        
        processedTokens++;
        setProgress((processedTokens / totalTokens) * 100);
      }
      
      setResults(backtestResults);
      
      toast({
        title: "Backtesting Complete",
        description: `Analyzed ${processedTokens} tokens with ${backtestResults.length} passing security checks`,
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

  const calculateActualReturn = (token: any): number => {
    return 0;
  };

  const fetchHistoricalTokens = async () => {
    return [];
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Trading Strategy Backtesting</h2>
        <Button 
          onClick={runBacktest}
          disabled={isRunning}
          className="gradient-bg hover:opacity-90 transition-all duration-300"
        >
          {isRunning ? "Running..." : "Run Backtest"}
        </Button>
      </div>

      {isRunning && (
        <Progress value={progress} className="w-full" />
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="chart-container h-[400px] w-full">
            <LineChart
              width={800}
              height={400}
              data={results}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="timestamp" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2C',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actualReturn" 
                stroke="#9b87f5" 
                name="Actual Return"
              />
            </LineChart>
          </div>

          <div className="metrics-grid">
            <Card className="metric-card">
              <h3 className="font-semibold mb-2 text-gray-400">Total Trades</h3>
              <p className="text-2xl gradient-text">{results.length}</p>
            </Card>
            <Card className="metric-card">
              <h3 className="font-semibold mb-2 text-gray-400">Success Rate</h3>
              <p className="text-2xl gradient-text">
                {calculateSuccessRate(results)}%
              </p>
            </Card>
            <Card className="metric-card">
              <h3 className="font-semibold mb-2 text-gray-400">Average Return</h3>
              <p className="text-2xl gradient-text">
                {calculateAverageReturn(results)}%
              </p>
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
};

const calculateSuccessRate = (results: BacktestResult[]): number => {
  const successfulTrades = results.filter(r => r.actualReturn > 0).length;
  return Math.round((successfulTrades / results.length) * 100);
};

const calculateAverageReturn = (results: BacktestResult[]): number => {
  const totalReturn = results.reduce((sum, r) => sum + r.actualReturn, 0);
  return Math.round((totalReturn / results.length) * 100) / 100;
};