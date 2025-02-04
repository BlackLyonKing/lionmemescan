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
    const { data: cachedData, error: cacheError } = await supabase
      .from('cached_top_tokens')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    // If we have recent data (less than 5 minutes old), return it
    if (cachedData && 
        cachedData.last_updated && 
        (new Date().getTime() - new Date(cachedData.last_updated).getTime()) < 300000) {
      console.log('Returning cached data');
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
    
    if (!response.ok) {
      console.error('DexScreener API error:', response.status, response.statusText);
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DexScreener response:', JSON.stringify(data).slice(0, 200) + '...'); // Log first 200 chars

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: response is not an object');
    }

    if (!data.pairs || !Array.isArray(data.pairs)) {
      // If no fresh data and we have cached data (even if old), return cached
      if (cachedData) {
        console.log('No fresh data available, returning old cached data');
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
      throw new Error('Invalid response format: pairs is not an array');
    }

    // Process and format the data
    const processedData = data.pairs
      .filter((pair: any) => 
        pair && 
        pair.baseToken && 
        typeof pair.priceUsd === 'string' && 
        typeof pair.volume24h === 'string' &&
        pair.liquidity?.usd
      )
      .map((pair: any) => ({
        name: pair.baseToken.name || 'Unknown',
        symbol: pair.baseToken.symbol || 'UNKNOWN',
        price: parseFloat(pair.priceUsd) || 0,
        priceChange24h: parseFloat(pair.priceChange24h || '0'),
        volume24h: parseFloat(pair.volume24h || '0'),
        marketCap: (parseFloat(pair.liquidity?.usd || '0') * parseFloat(pair.priceUsd || '0')) || 0,
        contractAddress: pair.baseToken.address,
      }))
      .sort((a: any, b: any) => b.marketCap - a.marketCap)
      .slice(0, 100);

    if (processedData.length === 0) {
      // If no valid pairs and we have cached data (even if old), return cached
      if (cachedData) {
        console.log('No valid pairs found, returning old cached data');
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
      throw new Error('No valid pairs found and no cached data available');
    }

    // Cache the new data
    const { error: insertError } = await supabase
      .from('cached_top_tokens')
      .insert({
        token_data: processedData,
        last_updated: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error caching data:', insertError);
    }

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