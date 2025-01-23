// Phantom's recommended RPC endpoints
export const RPC_ENDPOINTS = [
  "https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ",
  "https://solana-mainnet.g.alchemy.com/v2/demo",
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com"
];

export const getConnection = async () => {
  const { Connection } = await import("@solana/web3.js");
  
  // Try each endpoint until one works
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      console.log("Attempting to connect to RPC endpoint:", endpoint);
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      });
      
      // Test the connection
      await connection.getLatestBlockhash('finalized');
      console.log("Successfully connected to:", endpoint);
      return connection;
    } catch (error) {
      console.error(`Failed to connect to ${endpoint}:`, error);
      continue;
    }
  }
  
  throw new Error("Failed to connect to any RPC endpoint");
};