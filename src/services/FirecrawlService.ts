import { CrawlResponse } from '@/types/crawl';

export class FirecrawlService {
  // Make this method public so it can be accessed from components
  static getStorageKeyForWallet(key: string, walletAddress?: string | null): string {
    return walletAddress ? `firecrawl_${key}_${walletAddress}` : `firecrawl_${key}`;
  }

  static saveApiKey(apiKey: string, walletAddress?: string | null): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    const storageData = {
      key: apiKey,
      expiresAt: expiresAt.toISOString()
    };
    
    localStorage.setItem(
      this.getStorageKeyForWallet('api_key', walletAddress),
      JSON.stringify(storageData)
    );

    // Add to previous keys if not already present
    const previousKeys = this.getPreviousKeys(walletAddress);
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    if (!previousKeys.includes(maskedKey)) {
      previousKeys.unshift(maskedKey);
      localStorage.setItem(
        this.getStorageKeyForWallet('previous_keys', walletAddress),
        JSON.stringify(previousKeys)
      );
    }
  }

  static getApiKey(walletAddress?: string | null): string | null {
    try {
      const storedData = localStorage.getItem(this.getStorageKeyForWallet('api_key', walletAddress));
      if (!storedData) return null;

      const { key, expiresAt } = JSON.parse(storedData);
      if (new Date(expiresAt) < new Date()) {
        this.unlinkApiKey(walletAddress);
        return null;
      }

      return key;
    } catch (error) {
      console.error('Error parsing API key from localStorage:', error);
      return null;
    }
  }

  static unlinkApiKey(walletAddress?: string | null): void {
    localStorage.removeItem(this.getStorageKeyForWallet('api_key', walletAddress));
  }

  static getPreviousKeys(walletAddress?: string | null): string[] {
    try {
      const storedKeys = localStorage.getItem(this.getStorageKeyForWallet('previous_keys', walletAddress));
      return storedKeys ? JSON.parse(storedKeys) : [];
    } catch (error) {
      console.error('Error parsing previous keys from localStorage:', error);
      return [];
    }
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
        name: "Sample Coin",
        symbol: "SAMPLE",
        marketCap: 15000,
        threadUrl: "https://pump.fun/thread/123",
        threadComments: 150,
        dexStatus: "paid",
        graduated: false,
        socialScore: 85,
        meta: ["pepe", "wojak", "fart"],
        bundledBuys: 3,
        creatorRisk: {
          previousScams: 2,
          riskLevel: "high",
          lastScamDate: "2024-01-15",
        },
      }]
    };
  }
}