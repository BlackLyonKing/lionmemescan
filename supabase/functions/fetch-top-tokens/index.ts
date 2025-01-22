import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we have recent cached data
    const { data: cachedData } = await supabase
      .from('cached_top_tokens')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (cachedData && 
        new Date().getTime() - new Date(cachedData.last_updated).getTime() < 3600000) {
      return new Response(JSON.stringify(cachedData.token_data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch new data from DexScreener
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/solana',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

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

    // Cache the new data
    await supabase
      .from('cached_top_tokens')
      .insert([
        {
          token_data: topTokens,
          last_updated: new Date().toISOString(),
        }
      ]);

    return new Response(JSON.stringify(topTokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});