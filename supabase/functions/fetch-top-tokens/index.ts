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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check cached data first
    const { data: cachedData } = await supabase
      .from('cached_top_tokens')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    // If we have recent cached data (less than 5 minutes old), use it
    if (cachedData && new Date(cachedData.last_updated) > new Date(Date.now() - 5 * 60 * 1000)) {
      console.log('Returning cached data');
      return new Response(JSON.stringify(cachedData.token_data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching fresh data from DexScreener API...');
    
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/solana',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.pairs || !Array.isArray(data.pairs)) {
      throw new Error('Invalid response format from DexScreener API');
    }

    // Process and filter the top tokens
    const topTokens = data.pairs
      .filter(pair => 
        pair?.baseToken?.name && 
        pair?.baseToken?.symbol && 
        pair?.priceUsd && 
        pair?.liquidity?.usd && 
        !isNaN(parseFloat(pair.priceUsd)) && 
        !isNaN(parseFloat(pair.liquidity.usd))
      )
      .sort((a, b) => parseFloat(b.liquidity.usd) - parseFloat(a.liquidity.usd))
      .slice(0, 20)
      .map(pair => ({
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity.usd),
        address: pair.baseToken.address,
      }));

    // Cache the new data
    await supabase
      .from('cached_top_tokens')
      .insert({
        token_data: topTokens,
        last_updated: new Date().toISOString(),
      });

    console.log(`Successfully processed ${topTokens.length} tokens`);
    
    return new Response(JSON.stringify(topTokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-top-tokens function:', error);
    
    // If there's an error, try to return the last cached data as fallback
    try {
      const { data: lastCachedData } = await supabase
        .from('cached_top_tokens')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (lastCachedData) {
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