import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Fetching top tokens from cached data');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get cached data
    const { data: cachedData, error: cacheError } = await supabase
      .from('cached_top_tokens')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (cacheError) {
      console.error('Error fetching cached data:', cacheError);
      throw new Error('Failed to fetch cached token data');
    }

    if (!cachedData || !cachedData.token_data) {
      console.log('No cached data found, returning empty array');
      return new Response(
        JSON.stringify([]),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    console.log('Returning cached token data from:', cachedData.last_updated);
    
    return new Response(
      JSON.stringify(cachedData.token_data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error) {
    console.error('Error in fetch-top-tokens:', error);
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