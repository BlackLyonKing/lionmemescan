import { CrawlResponse, CrawlStatusResponse } from '@/types/crawl';

export class FirecrawlService {
  private static getStorageKeyForWallet(key: string, walletAddress?: string | null): string {
    return walletAddress ? `firecrawl_${key}_${walletAddress}` : `firecrawl_${key}`;
  }

  static saveApiKey(apiKey: string, walletAddress?: string | null): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    localStorage.setItem(
      this.getStorageKeyForWallet('api_key', walletAddress),
      JSON.stringify({ key: apiKey, expiresAt: expiresAt.toISOString() })
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
    const storedData = localStorage.getItem(this.getStorageKeyForWallet('api_key', walletAddress));
    if (!storedData) return null;

    const { key, expiresAt } = JSON.parse(storedData);
    if (new Date(expiresAt) < new Date()) {
      this.unlinkApiKey(walletAddress);
      return null;
    }

    return key;
  }

  static unlinkApiKey(walletAddress?: string | null): void {
    localStorage.removeItem(this.getStorageKeyForWallet('api_key', walletAddress));
  }

  static getPreviousKeys(walletAddress?: string | null): string[] {
    const storedKeys = localStorage.getItem(this.getStorageKeyForWallet('previous_keys', walletAddress));
    return storedKeys ? JSON.parse(storedKeys) : [];
  }

  static async crawlUrl(url: string): Promise<CrawlResponse> {
    // Return sample data for demonstration
    return {
      success: true as const,
      status: "completed",
      completed: 1,
      total: 1,
      creditsUsed: 1,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      data: [{
        name: "BONK",
        symbol: "BONK",
        marketCap: 1000000,
        threadUrl: "https://example.com",
        threadComments: 150,
        dexStatus: "paid",
        meta: ["trending", "new"],
        socialScore: 85,
        bundledBuys: 1,
        creatorRisk: {
          previousScams: false
        }
      }]
    };
  }
}