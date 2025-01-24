import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Fetching data from DexScreener API...');
    
    // Using DexScreener API instead of Bullex as it's more reliable
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/solana',
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('DexScreener API response received');
    
    if (!data || !Array.isArray(data.pairs)) {
      throw new Error('Invalid response format from DexScreener API');
    }

    // Process and map the top tokens
    const topTokens = data.pairs
      .sort((a, b) => parseFloat(b.priceUsd) - parseFloat(a.priceUsd))
      .slice(0, 20)
      .map(pair => ({
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd),
        volume24h: parseFloat(pair.volume.h24),
        liquidity: parseFloat(pair.liquidity.usd),
        address: pair.baseToken.address,
      }));

    console.log(`Successfully processed ${topTokens.length} tokens`);
    
    // Cache the new data
    const { error: cacheError } = await supabase
      .from('cached_top_tokens')
      .insert({
        token_data: topTokens,
        last_updated: new Date().toISOString(),
      });

    if (cacheError) {
      console.error('Error caching tokens:', cacheError);
    }

    return new Response(JSON.stringify(topTokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-top-tokens function:', error);
    
    try {
      // Attempt to fetch cached data as fallback
      const { data: lastCachedData, error: cacheError } = await supabase
        .from('cached_top_tokens')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (cacheError) {
        console.error('Error fetching cached data:', cacheError);
      }

      if (lastCachedData?.token_data) {
        console.log('Returning last cached data due to error');
        return new Response(JSON.stringify(lastCachedData.token_data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (fallbackError) {
      console.error('Error fetching fallback cached data:', fallbackError);
    }
    
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