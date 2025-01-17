export interface Memecoin {
  name: string;
  symbol: string;
  marketCap: number;
  threadUrl: string;
  threadComments: number;
  dexStatus: "paid" | "unpaid";
  graduated: boolean;
  socialScore: number;
  meta: string[];
  contractAddress?: string;
  chainId?: number;
  bundledBuys?: number;
}