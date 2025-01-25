import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TokenAccountsFilter } from "@solana/web3.js";
import { supabase } from "@/integrations/supabase/client";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDT_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const TREASURY_WALLET = new PublicKey("YOUR_TREASURY_WALLET_ADDRESS"); // Replace with actual treasury wallet

export const getTokenBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  mintAddress: PublicKey
): Promise<number> => {
  console.log(`Checking token balance for mint: ${mintAddress.toString()}`);
  
  const filter: TokenAccountsFilter = {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  };

  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      filter
    );

    const tokenAccount = accounts.value.find(
      (account) => account.account.data.parsed.info.mint === mintAddress.toString()
    );

    if (!tokenAccount) {
      console.log(`No token account found for mint: ${mintAddress.toString()}`);
      return 0;
    }

    return Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return 0;
  }
};

export const checkWalletBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  requiredAmountUSD: number,
  solPrice: number
): Promise<boolean> => {
  console.log(`Checking wallet balance for ${requiredAmountUSD} USD requirement`);
  
  try {
    // Check SOL balance
    const solBalance = await connection.getBalance(walletAddress) / LAMPORTS_PER_SOL;
    const solValue = solBalance * solPrice;
    
    if (solValue >= requiredAmountUSD) {
      console.log(`Sufficient SOL balance found: ${solBalance} SOL (${solValue} USD)`);
      return true;
    }

    // Check USDC balance
    const usdcBalance = await getTokenBalance(connection, walletAddress, USDC_MINT);
    if (usdcBalance >= requiredAmountUSD) {
      console.log(`Sufficient USDC balance found: ${usdcBalance} USDC`);
      return true;
    }

    // Check USDT balance
    const usdtBalance = await getTokenBalance(connection, walletAddress, USDT_MINT);
    if (usdtBalance >= requiredAmountUSD) {
      console.log(`Sufficient USDT balance found: ${usdtBalance} USDT`);
      return true;
    }

    console.log("Insufficient balance found in wallet");
    return false;
  } catch (error) {
    console.error("Error checking wallet balance:", error);
    return false;
  }
};

export const hasValidSubscription = async (walletAddress: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select()
    .eq('wallet_address', walletAddress)
    .gte('valid_until', new Date().toISOString())
    .single();

  if (error) {
    console.error("Error checking subscription:", error);
    return false;
  }

  return !!data;
};