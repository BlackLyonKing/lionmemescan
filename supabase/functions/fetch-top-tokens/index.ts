import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Fetching data from DexScreener API...');
    
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
      console.error(`DexScreener API responded with status: ${response.status}`);
      throw new Error(`DexScreener API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate the response data
    if (!data || !data.pairs || !Array.isArray(data.pairs)) {
      console.error('Invalid response format from DexScreener API:', data);
      throw new Error('Invalid response format from DexScreener API');
    }

    // Process and filter the top 20 tokens
    const topTokens = data.pairs
      .filter(pair => pair && pair.baseToken && pair.priceUsd) // Ensure required properties exist
      .sort((a, b) => parseFloat(b.priceUsd) - parseFloat(a.priceUsd))
      .slice(0, 20)
      .map(pair => ({
        name: pair.baseToken.name || 'Unknown',
        symbol: pair.baseToken.symbol || 'UNKNOWN',
        price: parseFloat(pair.priceUsd) || 0,
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        address: pair.baseToken.address,
      }));

    console.log(`Successfully processed ${topTokens.length} tokens`);
    
    return new Response(JSON.stringify(topTokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-top-tokens function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch top tokens',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});