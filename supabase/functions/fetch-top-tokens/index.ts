import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch data from DexScreener API
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/solana',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process and filter the top 20 tokens
    const topTokens = data.pairs
      .sort((a: any, b: any) => b.priceUsd - a.priceUsd)
      .slice(0, 20)
      .map((pair: any) => ({
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: pair.priceUsd,
        volume24h: pair.volume.h24,
        liquidity: pair.liquidity.usd,
        address: pair.baseToken.address,
      }));

    console.log('Successfully fetched and processed top tokens');
    
    return new Response(JSON.stringify(topTokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch top tokens' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});