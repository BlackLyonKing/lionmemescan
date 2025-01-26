import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TokenAccountsFilter } from "@solana/web3.js";
import { supabase } from "@/integrations/supabase/client";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDT_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const TREASURY_WALLET = new PublicKey("EWcYCiTqkQomuGWg3RH7m5Uo8q7QX8eQ8CoKaaoRJTsM");

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
  requiredAmount: number
): Promise<{ hasBalance: boolean; currentBalance: number }> => {
  try {
    console.log(`Checking SOL balance for wallet: ${walletAddress.toString()}`);
    const balance = await connection.getBalance(walletAddress);
    const solBalance = balance / LAMPORTS_PER_SOL;
    console.log(`Current SOL balance: ${solBalance}`);
    console.log(`Required amount: ${requiredAmount}`);
    
    return {
      hasBalance: solBalance >= requiredAmount,
      currentBalance: solBalance
    };
  } catch (error) {
    console.error("Error checking wallet balance:", error);
    return {
      hasBalance: false,
      currentBalance: 0
    };
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

export const getTreasuryWallet = () => TREASURY_WALLET;
