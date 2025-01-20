export interface ErrorResponse {
  success: false;
  error: string;
}

export interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
  error?: string;
}

export type CrawlResponse = CrawlStatusResponse | ErrorResponse;