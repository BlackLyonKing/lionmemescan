export interface WhaleStats {
  maxHolderPercentage: number;
  developerHoldingPercentage: number;
  topHoldersHistory?: string[];
}

export interface LiquidityStats {
  percentageChange24h: number;
  totalLiquidity: number;
}

export interface CreatorRisk {
  previousScams: number;
  riskLevel: "low" | "medium" | "high";
  lastScamDate?: string;
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
  creatorRisk?: CreatorRisk;
  whaleStats?: WhaleStats;
  liquidityStats?: LiquidityStats;
  riskScore?: number;
  logoUrl?: string;
}