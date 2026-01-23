import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, wallColor, ceilingColor, floorColor } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing image with colors:', { wallColor, ceilingColor, floorColor });

    const prompt = `You are a professional interior design photo editor. Your task is to repaint ONLY architectural surfaces in this room photo.

REPAINT THESE SURFACES with solid colors:
1. WALLS: Repaint to solid color ${wallColor}. This includes ALL wall surfaces - painted walls, wallpaper, tiles on walls. Replace any pattern/texture with solid flat color.
2. CEILING: Repaint to solid color ${ceilingColor}. The entire ceiling surface.
3. FLOOR: Repaint to solid color ${floorColor}. This includes ALL floor covering - laminate, parquet, tiles, carpet, wood flooring. Replace the entire floor surface with solid color.

CRITICAL - DO NOT TOUCH:
- Any furniture (sofas, chairs, tables, beds, wardrobes, cabinets, shelves, desks)
- Doors and door frames
- Windows and window frames
- Curtains and blinds
- Decorations, paintings, mirrors
- Appliances
- Plants
- Any objects in the room

The repainting should:
- Cover the ENTIRE surface area of walls, ceiling, and floor
- Use SOLID FLAT colors (no patterns, no textures)
- Preserve natural shadows and lighting gradients for realism
- Keep the perspective and geometry unchanged`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { url: imageBase64 } 
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Слишком много запросов. Подождите немного и попробуйте снова.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Требуется пополнение баланса для использования AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Ошибка при обработке изображения' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');
    
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!generatedImage) {
      console.error('No image in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'AI не смог обработать изображение. Попробуйте другое фото.', text: textResponse }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        image: generatedImage,
        message: textResponse || 'Цвета успешно изменены!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
