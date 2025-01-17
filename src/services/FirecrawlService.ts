import { CrawlResponse } from '@/types/crawl';

export class FirecrawlService {
  static async crawlPumpFun(): Promise<CrawlResponse> {
    // Return sample data for demonstration
    return {
      success: true,
      status: "completed",
      completed: 1,
      total: 1,
      creditsUsed: 1,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      data: [{
        name: "Sample Memecoin",
        symbol: "SMPL",
        marketCap: 150000,
        threadUrl: "https://pump.fun/thread/123",
        threadComments: 150,
        dexStatus: "paid",
        graduated: false,
        socialScore: 85,
        meta: ["pepe", "wojak", "trending"],
        bundledBuys: 3,
        creatorRisk: {
          previousScams: 0,  // Set to 0 so it's not filtered out
          riskLevel: "low",
          lastScamDate: null
        }
      }]
    };
  }
}