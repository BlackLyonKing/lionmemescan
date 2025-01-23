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

    console.log('Fetching data from Bullex API...');
    
    const response = await fetch(
      'https://api.bullex.io/v1/tokens/trending?chain=solana&limit=20&period=24h',
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`Bullex API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bullex API response:', JSON.stringify(data).slice(0, 200) + '...');
    
    if (!data || !Array.isArray(data.tokens)) {
      throw new Error('Invalid response format from Bullex API');
    }

    // Process and map the top tokens
    const topTokens = data.tokens.map(token => ({
      name: token.name,
      symbol: token.symbol,
      price: parseFloat(token.price),
      volume24h: parseFloat(token.volume24h),
      liquidity: parseFloat(token.liquidity),
      address: token.address,
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
      const { data: lastCachedData, error: cacheError } = await supabase
        .from('cached_top_tokens')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (cacheError) {
        console.error('Error fetching cached data:', cacheError);
      }

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