import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching data from DexScreener API...');
    
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/solana',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log('DexScreener API response:', JSON.stringify(data));
    
    // Validate the response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: data is not an object');
    }

    // Check if pairs exists and is an array, if not try to use the data directly
    const pairs = Array.isArray(data.pairs) ? data.pairs : 
                 Array.isArray(data) ? data : [];

    if (pairs.length === 0) {
      console.log('No valid pairs found in response');
      // Try to get cached data as fallback
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: cachedData } = await supabaseClient
        .from('cached_top_tokens')
        .select('token_data')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (cachedData?.token_data) {
        console.log('Returning cached data as fallback');
        return new Response(
          JSON.stringify(cachedData.token_data),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 200,
          },
        );
      }
      
      throw new Error('No valid pairs found and no cached data available');
    }

    // Process and map the top tokens
    const topTokens = pairs
      .filter(pair => {
        try {
          return (
            pair &&
            typeof pair === 'object' &&
            pair.baseToken &&
            typeof pair.baseToken === 'object' &&
            typeof pair.baseToken.name === 'string' &&
            typeof pair.baseToken.symbol === 'string' &&
            typeof pair.priceUsd === 'string' &&
            pair.liquidity &&
            typeof pair.liquidity.usd === 'string' &&
            !isNaN(parseFloat(pair.priceUsd)) &&
            !isNaN(parseFloat(pair.liquidity.usd))
          );
        } catch (e) {
          console.error('Error validating pair:', e);
          return false;
        }
      })
      .sort((a, b) => parseFloat(b.liquidity.usd) - parseFloat(a.liquidity.usd))
      .slice(0, 20)
      .map(pair => ({
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd),
        volume24h: pair.volume?.h24 ? parseFloat(pair.volume.h24) : 0,
        liquidity: parseFloat(pair.liquidity.usd),
        address: pair.baseToken.address,
      }));

    // Cache the results
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('cached_top_tokens')
      .upsert({
        token_data: topTokens,
        last_updated: new Date().toISOString()
      });

    return new Response(
      JSON.stringify(topTokens),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in fetch-top-tokens:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch top tokens',
        details: error.toString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});