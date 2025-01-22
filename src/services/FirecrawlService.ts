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

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Supabase function');
      const { data, error } = await supabase.functions.invoke('test-firecrawl-key', {
        body: { apiKey }
      });

      if (error) {
        console.error('Error testing API key:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async crawlPumpFun(): Promise<CrawlResponse> {
    try {
      console.log('Making crawl request to Supabase function');
      const { data, error } = await supabase.functions.invoke('crawl-pump-fun');

      if (error) {
        console.error('Error during crawl:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to connect to Firecrawl API'
        };
      }

      return data as CrawlResponse;
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API'
      };
    }
  }
}