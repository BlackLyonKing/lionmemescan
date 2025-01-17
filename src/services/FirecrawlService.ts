interface FirecrawlConfig {
  apiKey: string;
}

interface FirecrawlApp {
  crawlUrl: (url: string, options: any) => Promise<CrawlResponse>;
}

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

// Mock FirecrawlApp implementation since we can't access the actual package
class MockFirecrawlApp implements FirecrawlApp {
  private apiKey: string;

  constructor(config: FirecrawlConfig) {
    this.apiKey = config.apiKey;
  }

  async crawlUrl(url: string, options: any): Promise<CrawlResponse> {
    console.log('Mock crawling URL:', url, 'with options:', options);
    // Simulate API response
    return {
      success: true,
      status: 'completed',
      completed: 100,
      total: 100,
      creditsUsed: 1,
      expiresAt: new Date().toISOString(),
      data: []
    };
  }
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new MockFirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async crawlPumpFun(): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making crawl request to Firecrawl API');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new MockFirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl('https://pump.fun', {
        limit: 100,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      });

      if (!crawlResponse.success) {
        console.error('Crawl failed:', (crawlResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Failed to crawl website' 
        };
      }

      console.log('Crawl successful:', crawlResponse);
      return { 
        success: true,
        data: crawlResponse 
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}