import { Memecoin } from "@/types/memecoin";

interface RiskFactors {
  whaleConcentration: number;
  developerHoldings: number;
  bundledBuysRisk: number;
  socialSentiment: number;
  liquidityStability: number;
  contractVulnerability: number;
  rugPullIndicators: number;
}

export const calculateRiskScore = (coin: Memecoin): number => {
  const factors: RiskFactors = {
    whaleConcentration: calculateWhaleRisk(coin),
    developerHoldings: calculateDevHoldingsRisk(coin),
    bundledBuysRisk: calculateBundledBuysRisk(coin),
    socialSentiment: calculateSocialRisk(coin),
    liquidityStability: calculateLiquidityRisk(coin),
    contractVulnerability: calculateContractRisk(coin),
    rugPullIndicators: calculateRugPullRisk(coin),
  };

  // Updated weights with rug pull emphasis
  const weights = {
    whaleConcentration: 0.2,
    developerHoldings: 0.15,
    bundledBuysRisk: 0.1,
    socialSentiment: 0.1,
    liquidityStability: 0.15,
    contractVulnerability: 0.1,
    rugPullIndicators: 0.2,
  };

  const weightedScore = Object.entries(factors).reduce((score, [factor, value]) => {
    return score + value * weights[factor as keyof RiskFactors];
  }, 0);

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

const calculateContractRisk = (coin: Memecoin): number => {
  // Basic contract risk calculation based on available data
  let risk = 0;
  
  if (coin.creatorRisk?.previousScams) {
    risk += 0.5;
  }
  
  if (coin.creatorRisk?.riskLevel === 'high') {
    risk += 0.5;
  }
  
  return Math.min(1, risk);
};

const calculateRugPullRisk = (coin: Memecoin): number => {
  let risk = 0;
  
  // Check for common rug pull indicators
  if (coin.whaleStats?.maxHolderPercentage > 30) risk += 0.3;
  if (coin.whaleStats?.developerHoldingPercentage > 10) risk += 0.2;
  if (coin.liquidityStats?.totalLiquidity < 10000) risk += 0.2;
  if (coin.creatorRisk?.previousScams > 0) risk += 0.3;
  
  return Math.min(1, risk);
};

export const getRiskColor = (score: number): string => {
  if (score <= 3) return "text-green-500";
  if (score <= 5) return "text-yellow-500";
  if (score <= 7) return "text-orange-500";
  return "text-red-500";
};

export const getRiskLabel = (score: number): string => {
  if (score <= 3) return "Low Risk";
  if (score <= 6) return "Medium Risk";
  return "High Risk";
};

export const getRiskDescription = (coin: Memecoin): string[] => {
  const warnings: string[] = [];
  
  if (coin.whaleStats?.maxHolderPercentage > 15) {
    warnings.push(`Large whale holding detected (${coin.whaleStats.maxHolderPercentage}% held by single wallet)`);
  }
  
  if (coin.whaleStats?.developerHoldingPercentage > 3) {
    warnings.push(`High developer holdings (${coin.whaleStats.developerHoldingPercentage}%)`);
  }
  
  if (coin.bundledBuys && coin.bundledBuys > 2) {
    warnings.push(`Suspicious buying patterns detected (${coin.bundledBuys} bundled buys)`);
  }
  
  if (coin.liquidityStats?.percentageChange24h < -20) {
    warnings.push(`Significant liquidity decrease (${coin.liquidityStats.percentageChange24h}% in 24h)`);
  }
  
  if (coin.creatorRisk?.previousScams) {
    warnings.push(`Creator has history of ${coin.creatorRisk.previousScams} previous scams`);
  }
  
  if (coin.socialScore < 50) {
    warnings.push('Low social media engagement and community trust');
  }
  
  return warnings;
};
