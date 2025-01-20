import { Memecoin } from "@/types/memecoin";
import { calculateRiskScore } from "@/utils/riskCalculator";

class TrendingTokensService {
  private static instance: TrendingTokensService;
  private trendingTokens: Memecoin[] = [];
  private mostBoughtTokens: Memecoin[] = [];

  private constructor() {
    this.trendingTokens = this.generateMockTrendingTokens();
    this.mostBoughtTokens = this.generateMockMostBoughtTokens();
    
    setInterval(() => {
      console.log("Updating trending tokens...");
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
    return Array.from({ length: 20 }, (_, i) => {
      const marketCap = Math.random() * 10000000;
      const maxHolderPercentage = Math.random() * 30;
      const developerHoldingPercentage = Math.random() * 10;
      const liquidityChange = (Math.random() - 0.5) * 40; // -20 to +20
      const previousScams = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
      
      const coin: Memecoin = {
        name: `Trending Token ${i + 1}`,
        symbol: `TT${i + 1}`,
        marketCap,
        threadUrl: `https://example.com/tt${i + 1}`,
        threadComments: Math.floor(Math.random() * 1000),
        dexStatus: Math.random() > 0.5 ? "paid" : "unpaid",
        graduated: false,
        socialScore: Math.floor(Math.random() * 100),
        meta: ["trending", "new"],
        bundledBuys: Math.floor(Math.random() * 10),
        whaleStats: {
          maxHolderPercentage,
          developerHoldingPercentage,
        },
        liquidityStats: {
          percentageChange24h: liquidityChange,
          totalLiquidity: marketCap * 0.1,
        },
        creatorRisk: {
          previousScams,
          riskLevel: previousScams > 0 ? "high" : "low",
        },
      };
      
      coin.riskScore = calculateRiskScore(coin);
      return coin;
    });
  }

  private generateMockMostBoughtTokens(): Memecoin[] {
    return Array.from({ length: 20 }, (_, i) => {
      const marketCap = Math.random() * 10000000;
      const maxHolderPercentage = Math.random() * 30;
      const developerHoldingPercentage = Math.random() * 10;
      const liquidityChange = (Math.random() - 0.5) * 40;
      const previousScams = Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0;
      
      const coin: Memecoin = {
        name: `Popular Token ${i + 1}`,
        symbol: `PT${i + 1}`,
        marketCap,
        threadUrl: `https://example.com/pt${i + 1}`,
        threadComments: Math.floor(Math.random() * 1000),
        dexStatus: Math.random() > 0.5 ? "paid" : "unpaid",
        graduated: false,
        socialScore: Math.floor(Math.random() * 100),
        meta: ["popular", "verified"],
        bundledBuys: Math.floor(Math.random() * 10),
        whaleStats: {
          maxHolderPercentage,
          developerHoldingPercentage,
        },
        liquidityStats: {
          percentageChange24h: liquidityChange,
          totalLiquidity: marketCap * 0.1,
        },
        creatorRisk: {
          previousScams,
          riskLevel: previousScams > 0 ? "high" : "low",
        },
      };
      
      coin.riskScore = calculateRiskScore(coin);
      return coin;
    });
  }

  private async updateTrendingTokens() {
    this.trendingTokens = this.generateMockTrendingTokens();
    this.mostBoughtTokens = this.generateMockMostBoughtTokens();
  }

  public getTrendingTokens(hasAccess: boolean): Memecoin[] {
    console.log("Getting trending tokens, hasAccess:", hasAccess);
    return this.trendingTokens.map(token => ({
      ...token,
      name: hasAccess ? token.name : '****',
      symbol: hasAccess ? token.symbol : '***',
    }));
  }

  public getMostBoughtTokens(hasAccess: boolean): Memecoin[] {
    console.log("Getting most bought tokens, hasAccess:", hasAccess);
    return this.mostBoughtTokens.map(token => ({
      ...token,
      name: hasAccess ? token.name : '****',
      symbol: hasAccess ? token.symbol : '***',
    }));
  }
}

export default TrendingTokensService;