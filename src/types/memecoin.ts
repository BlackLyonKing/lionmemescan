export interface WhaleStats {
  maxHolderPercentage: number;
  developerHoldingPercentage: number;
  topHoldersHistory?: string[];
}

export interface LiquidityStats {
  percentageChange24h: number;
  totalLiquidity: number;
}

export interface Memecoin {
  name: string;
  symbol: string;
  marketCap: number;
  threadUrl: string;
  threadComments: number;
  dexStatus: "paid" | "unpaid";
  graduated: boolean;
  socialScore: number;
  meta: string[];
  contractAddress?: string;
  chainId?: number;
  bundledBuys?: number;
  creatorRisk?: {
    previousScams: number;
    riskLevel: "low" | "medium" | "high";
    lastScamDate?: string;
  };
  whaleStats?: WhaleStats;
  liquidityStats?: LiquidityStats;
  riskScore?: number;
}