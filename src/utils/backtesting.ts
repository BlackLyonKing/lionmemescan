import { Memecoin } from "@/types/memecoin";
import { calculateRiskScore } from "./riskCalculator";

interface BacktestResult {
  timestamp: number;
  predictedRisk: number;
  actualOutcome: 'rugpull' | 'legitimate';
  accuracy: number;
}

export const runBacktest = async (
  historicalData: Memecoin[],
  timeframe: { start: number; end: number }
): Promise<BacktestResult[]> => {
  console.log('Running backtest with data points:', historicalData.length);
  
  const results: BacktestResult[] = [];
  let correctPredictions = 0;
  
  for (const coin of historicalData) {
    const riskScore = calculateRiskScore(coin);
    const wasRugPull = isRugPull(coin); // Determine if the coin was actually a rug pull
    
    const accurate = (riskScore > 7 && wasRugPull) || (riskScore <= 7 && !wasRugPull);
    if (accurate) correctPredictions++;
    
    results.push({
      timestamp: Date.now(),
      predictedRisk: riskScore,
      actualOutcome: wasRugPull ? 'rugpull' : 'legitimate',
      accuracy: (correctPredictions / results.length) * 100
    });
  }
  
  console.log('Backtest completed with accuracy:', results[results.length - 1]?.accuracy);
  return results;
};

const isRugPull = (coin: Memecoin): boolean => {
  // Define criteria for what constitutes a rug pull
  const rugPullIndicators = [
    coin.liquidityStats?.percentageChange24h < -50,
    coin.whaleStats?.maxHolderPercentage > 30,
    coin.creatorRisk?.previousScams > 0,
    coin.bundledBuys && coin.bundledBuys > 5
  ];
  
  return rugPullIndicators.filter(Boolean).length >= 2;
};