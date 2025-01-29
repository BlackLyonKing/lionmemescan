import { useQuery } from "@tanstack/react-query";

const fetchSolanaPrice = async () => {
  console.log("Fetching Solana price from CoinGecko");
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Solana price data:", data);
    return data.solana.usd;
  } catch (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }
};

export const useSolanaPrice = () => {
  return useQuery({
    queryKey: ["solanaPrice"],
    queryFn: fetchSolanaPrice,
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};