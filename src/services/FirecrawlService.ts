import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

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
    console.log('API key saved successfully');
  }

  static getApiKey(walletAddress?: string): string | null {
    const storageKey = this.getStorageKeyForWallet(this.API_KEY_PREFIX, walletAddress);
    return localStorage.getItem(storageKey);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      const testResponse = await this.firecrawlApp.crawlUrl('https://example.com', {
        limit: 1
      });
      return testResponse.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async crawlPumpFun(): Promise<CrawlResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making crawl request to Firecrawl API');
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