import { Memecoin } from "@/types/memecoin";

interface RiskFactors {
  whaleConcentration: number;
  developerHoldings: number;
  bundledBuysRisk: number;
  socialSentiment: number;
  liquidityStability: number;
}

export const calculateRiskScore = (coin: Memecoin): number => {
  const factors: RiskFactors = {
    whaleConcentration: calculateWhaleRisk(coin),
    developerHoldings: calculateDevHoldingsRisk(coin),
    bundledBuysRisk: calculateBundledBuysRisk(coin),
    socialSentiment: calculateSocialRisk(coin),
    liquidityStability: calculateLiquidityRisk(coin),
  };

  // Weights for each factor (total = 1)
  const weights = {
    whaleConcentration: 0.25,
    developerHoldings: 0.2,
    bundledBuysRisk: 0.2,
    socialSentiment: 0.15,
    liquidityStability: 0.2,
  };

  // Calculate weighted average
  const weightedScore = Object.entries(factors).reduce((score, [factor, value]) => {
    return score + value * weights[factor as keyof RiskFactors];
  }, 0);

  // Normalize to 1-10 scale
  return Math.max(1, Math.min(10, Math.round(weightedScore * 10)));
};

const calculateWhaleRisk = (coin: Memecoin): number => {
  const maxWhalePercentage = coin.whaleStats?.maxHolderPercentage || 0;
  return maxWhalePercentage > 15 ? 1 : maxWhalePercentage / 15;
};

const calculateDevHoldingsRisk = (coin: Memecoin): number => {
  const devPercentage = coin.whaleStats?.developerHoldingPercentage || 0;
  return devPercentage > 3 ? 1 : devPercentage / 3;
};

const calculateBundledBuysRisk = (coin: Memecoin): number => {
  const bundledBuys = coin.bundledBuys || 0;
  return bundledBuys > 2 ? 1 : bundledBuys / 2;
};

const calculateSocialRisk = (coin: Memecoin): number => {
  // Inverse of social score (higher social score = lower risk)
  return 1 - (coin.socialScore / 100);
};

const calculateLiquidityRisk = (coin: Memecoin): number => {
  const liquidityChange = coin.liquidityStats?.percentageChange24h || 0;
  return liquidityChange < -20 ? 1 : Math.abs(liquidityChange) / 20;
};

export const getRiskColor = (score: number): string => {
  if (score <= 3) return "text-green-500";
  if (score <= 6) return "text-yellow-500";
  return "text-red-500";
};

export const getRiskLabel = (score: number): string => {
  if (score <= 3) return "Low Risk";
  if (score <= 6) return "Medium Risk";
  return "High Risk";
};