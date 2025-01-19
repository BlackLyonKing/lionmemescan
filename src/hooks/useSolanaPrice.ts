import { useQuery } from "@tanstack/react-query";

const fetchSolanaPrice = async () => {
  console.log("Fetching Solana price from CoinGecko");
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  const data = await response.json();
  console.log("Solana price data:", data);
  return data.solana.usd;
};

export const useSolanaPrice = () => {
  return useQuery({
    queryKey: ["solanaPrice"],
    queryFn: fetchSolanaPrice,
    refetchInterval: 60000, // Refresh every minute
  });
};