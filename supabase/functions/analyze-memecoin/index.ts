import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memecoinData } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('Analyzing memecoin data:', memecoinData);

    const systemPrompt = `You are an expert cryptocurrency analyst specializing in memecoins. 
    Analyze the provided memecoin data and provide insights based on these key metrics:
    - Market cap (particularly promising if under $20k)
    - Social activity and growth
    - Thread responses and engagement
    - Security metrics from GoPlus
    - Whale wallet activities
    
    Focus on identifying early-stage opportunities with high growth potential.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Please analyze this memecoin data and provide insights about its growth potential: ${JSON.stringify(memecoinData, null, 2)}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('AI analysis completed');

    return new Response(JSON.stringify({
      analysis: data.choices[0].message.content,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-memecoin function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});