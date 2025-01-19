export class FirecrawlService {
  private static readonly API_KEY_PREFIX = 'firecrawl_api_key';
  private static readonly PREVIOUS_KEYS_PREFIX = 'firecrawl_previous_keys';
  private static readonly RATE_LIMIT_PREFIX = 'firecrawl_rate_limit';
  private static readonly MAX_PAGES = 500;
  private static readonly SCRAPES_PER_MINUTE = 10;
  private static readonly CRAWLS_PER_MINUTE = 1;

  static getStorageKeyForWallet(prefix: string, walletAddress?: string): string {
    return walletAddress ? `${prefix}_${walletAddress}` : prefix;
  }

  static saveApiKey(apiKey: string, walletAddress?: string): void {
    const storageKey = this.getStorageKeyForWallet(this.API_KEY_PREFIX, walletAddress);
    localStorage.setItem(storageKey, apiKey);
    
    // Set expiration time (30 minutes from now)
    const expirationTime = new Date().getTime() + 30 * 60 * 1000;
    localStorage.setItem(`${storageKey}_expiration`, expirationTime.toString());
  }

  static getApiKey(walletAddress?: string): string | null {
    const storageKey = this.getStorageKeyForWallet(this.API_KEY_PREFIX, walletAddress);
    const apiKey = localStorage.setItem(storageKey);
    const expirationTime = localStorage.getItem(`${storageKey}_expiration`);

    if (!apiKey || !expirationTime) {
      return null;
    }

    // Check if the API key has expired
    if (new Date().getTime() > parseInt(expirationTime)) {
      this.unlinkApiKey(walletAddress);
      return null;
    }

    return apiKey;
  }

  static unlinkApiKey(walletAddress?: string): void {
    const storageKey = this.getStorageKeyForWallet(this.API_KEY_PREFIX, walletAddress);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_expiration`);
  }

  static getPreviousKeys(walletAddress?: string): string[] {
    const storageKey = this.getStorageKeyForWallet(this.PREVIOUS_KEYS_PREFIX, walletAddress);
    const previousKeys = localStorage.getItem(storageKey);
    return previousKeys ? JSON.parse(previousKeys) : [];
  }

  private static checkRateLimit(walletAddress?: string): boolean {
    const now = Date.now();
    const storageKey = this.getStorageKeyForWallet(this.RATE_LIMIT_PREFIX, walletAddress);
    const rateLimit = localStorage.getItem(storageKey);
    const rateLimitData = rateLimit ? JSON.parse(rateLimit) : { 
      lastCrawl: 0,
      crawlCount: 0,
      lastScrape: 0,
      scrapeCount: 0
    };

    // Reset counters if minute has passed
    if (now - rateLimitData.lastCrawl >= 60000) {
      rateLimitData.crawlCount = 0;
    }
    if (now - rateLimitData.lastScrape >= 60000) {
      rateLimitData.scrapeCount = 0;
    }

    // Check limits
    if (rateLimitData.crawlCount >= this.CRAWLS_PER_MINUTE || 
        rateLimitData.scrapeCount >= this.SCRAPES_PER_MINUTE) {
      return false;
    }

    // Update rate limit data
    rateLimitData.lastCrawl = now;
    rateLimitData.crawlCount++;
    localStorage.setItem(storageKey, JSON.stringify(rateLimitData));
    
    return true;
  }

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
          previousScams: 0,
          riskLevel: "low",
          lastScamDate: null
        }
      }]
    };
  }
}