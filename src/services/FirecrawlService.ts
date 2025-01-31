import FirecrawlApp from '@mendable/firecrawl-js';
import { supabase } from "@/integrations/supabase/client";

interface ErrorResponse {
  success: false;
  error: string;
}

interface ExtractResponse {
  success: true;
  projects: {
    name: string;
    symbol: string;
    contract: string;
    market_cap: number;
    price: number;
    volume: number;
    holders: number;
    socials: string[];
    graduated_percent: number;
    creation_time: string;
    timestamp: string;
  }[];
}

type CrawlResponse = ErrorResponse | ExtractResponse;

export class FirecrawlService {
  private static firecrawlApp: FirecrawlApp | null = null;

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key:', apiKey);
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      const response = await this.firecrawlApp.extract(['https://example.com'], {
        prompt: 'Test prompt',
        schema: { type: 'object' }
      });
      return 'success' in response && response.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async saveApiKey(apiKey: string): Promise<void> {
    console.log('Saving API key');
    this.firecrawlApp = new FirecrawlApp({ apiKey });
  }

  static async crawlPumpFun(): Promise<CrawlResponse> {
    try {
      console.log('Initiating pump.fun crawl');
      const { data: { api_key } } = await supabase.functions.invoke('get-firecrawl-key');
      
      if (!api_key) {
        return { 
          success: false, 
          error: 'Firecrawl API key not found' 
        };
      }

      this.firecrawlApp = new FirecrawlApp({ apiKey: api_key });

      const response = await this.firecrawlApp.extract([
        "https://pump.fun/*"
      ], {
        prompt: 'Extract project details including name, symbol, contract address, market cap, price, volume, holders, social links, graduated percentage, creation time, and timestamp.',
        schema: {
          type: 'object',
          properties: {
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  symbol: { type: 'string' },
                  contract: { type: 'string' },
                  market_cap: { type: 'number' },
                  price: { type: 'number' },
                  volume: { type: 'number' },
                  holders: { type: 'number' },
                  socials: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  graduated_percent: { type: 'number' },
                  creation_time: { type: 'string' },
                  timestamp: { type: 'string' }
                },
                required: ['name', 'symbol', 'contract', 'market_cap', 'price', 'volume', 'holders', 'graduated_percent', 'creation_time', 'timestamp']
              }
            }
          }
        }
      });

      if ('success' in response && !response.success) {
        return response as ErrorResponse;
      }

      return {
        success: true,
        projects: (response as any).projects
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl pump.fun' 
      };
    }
  }

  static async scanMemecoins(): Promise<CrawlResponse> {
    try {
      console.log('Initiating memecoin scan');
      const { data: { api_key } } = await supabase.functions.invoke('get-firecrawl-key');
      
      if (!api_key) {
        return { 
          success: false, 
          error: 'Firecrawl API key not found' 
        };
      }

      this.firecrawlApp = new FirecrawlApp({ apiKey: api_key });

      const response = await this.firecrawlApp.extract([
        "https://pump.fun/*"
      ], {
        prompt: 'Find projects with a market cap between $20k-$25k, less than 99% graduated, and fewer than 5 Trench.bot bundled wallets with less than 7% ownership. The oldest launch date should be within the last 90 minutes. Extract the project name, symbol, contract, market cap, price, volume, number of holders, social media links, graduated percentage, creation time, and timestamp. Return an empty array if no projects meet the criteria.',
        schema: {
          type: 'object',
          properties: {
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  symbol: { type: 'string' },
                  contract: { type: 'string' },
                  market_cap: { type: 'number' },
                  price: { type: 'number' },
                  volume: { type: 'number' },
                  holders: { type: 'number' },
                  socials: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  graduated_percent: { type: 'number' },
                  creation_time: { type: 'string' },
                  timestamp: { type: 'string' }
                },
                required: ['name', 'symbol', 'contract', 'market_cap', 'price', 'volume', 'holders', 'graduated_percent', 'creation_time', 'timestamp']
              }
            }
          }
        }
      });

      if ('success' in response && !response.success) {
        return response as ErrorResponse;
      }

      return {
        success: true,
        projects: (response as any).projects
      };
    } catch (error) {
      console.error('Error during scan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scan memecoins' 
      };
    }
  }
}