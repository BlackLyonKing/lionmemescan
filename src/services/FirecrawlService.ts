import { CrawlResponse } from '@/types/crawl';
import FirecrawlApp from '@mendable/firecrawl-js';

export class FirecrawlService {
  private static readonly API_KEY_PREFIX = 'firecrawl_api_key';
  private static readonly PREVIOUS_KEYS_PREFIX = 'firecrawl_previous_keys';
  private static readonly RATE_LIMIT_PREFIX = 'firecrawl_rate_limit';
  private static readonly MAX_PAGES = 500;
  private static readonly SCRAPES_PER_MINUTE = 10;
  private static readonly CRAWLS_PER_MINUTE = 1;
  private static firecrawlApp: FirecrawlApp | null = null;

  static getStorageKeyForWallet(prefix: string, walletAddress?: string): string {
    return walletAddress ? `${prefix}_${walletAddress}` : prefix;
  }

  static saveApiKey(apiKey: string, walletAddress?: string): void {
    const storageKey = this.getStorageKeyForWallet(this.API_KEY_PREFIX, walletAddress);
    localStorage.setItem(storageKey, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    
    // Set expiration time (30 minutes from now)
    const expirationTime = new Date().getTime() + 30 * 60 * 1000;
    localStorage.setItem(`${storageKey}_expiration`, expirationTime.toString());
  }

  static getApiKey(walletAddress?: string): string | null {
    const storageKey = this.getStorageKeyForWallet(this.API_KEY_PREFIX, walletAddress);
    const apiKey = localStorage.getItem(storageKey);
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
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    if (!this.checkRateLimit()) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const response = await this.firecrawlApp.crawlUrl('https://pump.fun', {
        limit: this.MAX_PAGES,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      });

      return response as CrawlResponse;
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}