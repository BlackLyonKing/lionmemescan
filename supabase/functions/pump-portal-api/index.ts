
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradeRequest {
  action: 'buy' | 'sell';
  mint: string;
  amount: number;
  denominatedInSol: boolean;
  slippage: number;
  priorityFee: number;
  pool: 'pump' | 'raydium' | 'auto';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('PUMP_PORTAL_API_KEY')
    if (!apiKey) {
      throw new Error('API key not configured')
    }

    const request = await req.json() as TradeRequest

    const response = await fetch('https://pumpportal.fun/api/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        action: request.action,
        mint: request.mint,
        amount: request.amount,
        denominatedInSol: request.denominatedInSol.toString(),
        slippage: request.slippage,
        priorityFee: request.priorityFee,
        pool: request.pool,
      }),
    })

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
