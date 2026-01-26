import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TintInput {
  COLOR: string;
  NAME: string;
  SERIES: string;
  PALETTE: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tints, clearPalette } = await req.json() as { 
      tints: TintInput[]; 
      clearPalette?: string;
    };

    if (!tints || !Array.isArray(tints)) {
      return new Response(
        JSON.stringify({ error: 'Invalid tints data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear existing palette if requested
    if (clearPalette) {
      console.log(`Clearing existing palette: ${clearPalette}`);
      const { error: deleteError } = await supabase
        .from('tints')
        .delete()
        .eq('palette', clearPalette);
      
      if (deleteError) {
        console.error('Error clearing palette:', deleteError);
      }
    }

    // Transform data to match DB schema
    const tintsToInsert = tints.map(t => ({
      hex_color: t.COLOR.toUpperCase(),
      name: t.NAME,
      series: t.SERIES || null,
      palette: t.PALETTE,
    }));

    console.log(`Importing ${tintsToInsert.length} tints...`);

    // Insert in batches of 500
    const batchSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < tintsToInsert.length; i += batchSize) {
      const batch = tintsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('tints')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error('Batch insert error:', error);
        return new Response(
          JSON.stringify({ error: error.message, batch: i }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      totalInserted += data?.length || 0;
      console.log(`Inserted batch ${i / batchSize + 1}, total: ${totalInserted}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: totalInserted,
        palettes: [...new Set(tints.map(t => t.PALETTE))]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
