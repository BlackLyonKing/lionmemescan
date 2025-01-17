export interface CreatorRisk {
  previousScams: number;
  riskLevel: string;
  lastScamDate: string;
}

export interface CrawlData {
  name: string;
  symbol: string;
  marketCap: number;
  threadUrl: string;
  threadComments: number;
  dexStatus: string;
  graduated: boolean;
  socialScore: number;
  meta: string[];
  bundledBuys: number;
  creatorRisk: CreatorRisk;
}

export interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: CrawlData[];
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type CrawlResponse = CrawlStatusResponse | ErrorResponse;