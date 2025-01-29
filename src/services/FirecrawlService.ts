import FirecrawlApp from '@mendable/firecrawl-js';
import { supabase } from "@/integrations/supabase/client";

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
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

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

      return {
        success: true,
        status: 'completed',
        completed: response.projects?.length || 0,
        total: response.projects?.length || 0,
        creditsUsed: 1,
        expiresAt: new Date().toISOString(),
        data: response.projects
      };
    } catch (error) {
      console.error('Error during memecoin scan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scan memecoins' 
      };
    }
  }
}