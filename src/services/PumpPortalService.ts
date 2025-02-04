import { supabase } from "@/integrations/supabase/client";

export interface TradeRequest {
  token_address: string;
  amount: number;
  side: 'BUY' | 'SELL';
}

export class PumpPortalService {
  static async executeTrade(request: TradeRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('pump-portal-api', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  }
}