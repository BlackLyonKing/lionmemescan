import { Memecoin } from "@/types/memecoin";

class TrendingTokensService {
  private static instance: TrendingTokensService;
  private trendingTokens: Memecoin[] = [];
  private mostBoughtTokens: Memecoin[] = [];

  private constructor() {
    // Initialize with mock data for now
    this.trendingTokens = this.generateMockTrendingTokens();
    this.mostBoughtTokens = this.generateMockMostBoughtTokens();
    
    // Update trending tokens every 5 minutes
    setInterval(() => {
      this.updateTrendingTokens();
    }, 5 * 60 * 1000);
  }

  public static getInstance(): TrendingTokensService {
    if (!TrendingTokensService.instance) {
      TrendingTokensService.instance = new TrendingTokensService();
    }
    return TrendingTokensService.instance;
  }

  private generateMockTrendingTokens(): Memecoin[] {
    // Generate 20 mock trending tokens
    return Array.from({ length: 20 }, (_, i) => ({
      name: `Trending Token ${i + 1}`,
      symbol: `TT${i + 1}`,
      marketCap: Math.random() * 10000000,
      threadUrl: `https://example.com/tt${i + 1}`,
      threadComments: Math.floor(Math.random() * 1000),
      dexStatus: Math.random() > 0.5 ? "paid" : "unpaid",
      graduated: false,
      socialScore: Math.floor(Math.random() * 100),
      meta: ["trending", "new"],
      bundledBuys: Math.floor(Math.random() * 10),
      riskScore: Math.floor(Math.random() * 10) + 1,
    }));
  }

  private generateMockMostBoughtTokens(): Memecoin[] {
    // Generate 20 mock most bought tokens
    return Array.from({ length: 20 }, (_, i) => ({
      name: `Popular Token ${i + 1}`,
      symbol: `PT${i + 1}`,
      marketCap: Math.random() * 10000000,
      threadUrl: `https://example.com/pt${i + 1}`,
      threadComments: Math.floor(Math.random() * 1000),
      dexStatus: Math.random() > 0.5 ? "paid" : "unpaid",
      graduated: false,
      socialScore: Math.floor(Math.random() * 100),
      meta: ["popular", "verified"],
      bundledBuys: Math.floor(Math.random() * 10),
      riskScore: Math.floor(Math.random() * 10) + 1,
    }));
  }

  private async updateTrendingTokens() {
    console.log("Updating trending tokens...");
    // In a real implementation, this would fetch from an API
    this.trendingTokens = this.generateMockTrendingTokens();
    this.mostBoughtTokens = this.generateMockMostBoughtTokens();
  }

  public getTrendingTokens(hasAccess: boolean): Memecoin[] {
    return this.trendingTokens.map(token => ({
      ...token,
      name: hasAccess ? token.name : '****',
      symbol: hasAccess ? token.symbol : '***',
    }));
  }

  public getMostBoughtTokens(hasAccess: boolean): Memecoin[] {
    return this.mostBoughtTokens.map(token => ({
      ...token,
      name: hasAccess ? token.name : '****',
      symbol: hasAccess ? token.symbol : '***',
    }));
  }
}

export default TrendingTokensService;