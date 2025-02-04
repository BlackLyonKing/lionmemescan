import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we have recent cached data
    const { data: cachedData } = await supabase
      .from('cached_top_tokens')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    // If we have recent data (less than 1 minute old), return it
    if (cachedData && 
        cachedData.last_updated && 
        (new Date().getTime() - new Date(cachedData.last_updated).getTime()) < 60000) {
      return new Response(
        JSON.stringify(cachedData.token_data),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Fetch fresh data from DexScreener
    console.log('Fetching fresh data from DexScreener');
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana');
    const data = await response.json();

    if (!data.pairs || !Array.isArray(data.pairs)) {
      throw new Error('Invalid response format: pairs is not an array');
    }

    // Process and format the data
    const processedData = data.pairs
      .filter((pair: any) => 
        pair.baseToken && 
        pair.priceUsd && 
        pair.volume24h &&
        pair.liquidity?.usd
      )
      .map((pair: any) => ({
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd),
        priceChange24h: parseFloat(pair.priceChange24h || 0),
        volume24h: parseFloat(pair.volume24h),
        marketCap: parseFloat(pair.liquidity?.usd || 0) * parseFloat(pair.priceUsd),
        contractAddress: pair.baseToken.address,
      }))
      .sort((a: any, b: any) => b.marketCap - a.marketCap)
      .slice(0, 100);

    // Cache the new data
    await supabase
      .from('cached_top_tokens')
      .insert({
        token_data: processedData,
        last_updated: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify(processedData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});