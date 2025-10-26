// Supabase Edge Function for /api/pools/top
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Query top pools from Supabase
    // Note: You'll need to create the `pools` table in Supabase first
    const { data: pools, error } = await supabase
      .from('pools')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Database error:', error);
      // Return fallback data
      return fallbackResponse();
    }

    if (!pools || pools.length === 0) {
      return fallbackResponse();
    }

    return new Response(
      JSON.stringify(pools),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30'
        } 
      }
    );
  } catch (error) {
    console.error('Failed to fetch pools:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch pools' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function fallbackResponse() {
  const now = Math.floor(Date.now() / 1000);
  const fallback = [
    {
      id: 1,
      token: 'BONK',
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      logo: null,
      line_bps: 300,
      confidence: 0.61,
      lock_ts: now + 4 * 3600,
      end_ts: now + 8 * 3600,
      totals: { over: 34_000_000_000, under: 29_000_000_000 },
      status: 'OPEN',
      pool_type: 'PvAI',
      ai: { confidence: 0.61, model: 'pve-v0.3.0', commit: '0xA1B2...ABCD', payload_url: null },
    },
    // Add more fallback pools as needed...
  ];

  return new Response(
    JSON.stringify(fallback),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
}


