
import { supabase } from "@/integrations/supabase/client";

export interface TradeRequest {
  action: 'buy' | 'sell';
  mint: string;
  amount: number;
  denominatedInSol: boolean;
  slippage: number;
  priorityFee: number;
  pool: 'pump' | 'raydium' | 'auto';
}

export interface TradeResponse {
  signature?: string;
  error?: string;
}

export class PumpPortalService {
  static async executeTrade(request: TradeRequest): Promise<TradeResponse> {
    try {
      console.log('Executing trade:', request);
      
      const { data, error } = await supabase.functions.invoke('pump-portal-api', {
        body: request
      });

      if (error) {
        console.error('Trade execution error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  }
}
