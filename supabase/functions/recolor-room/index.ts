import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation helpers
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB base64 limit
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/;

function validateImageBase64(imageBase64: unknown): { valid: boolean; error?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Изображение не предоставлено' };
  }
  
  if (imageBase64.length > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Изображение слишком большое (макс. 5MB)' };
  }
  
  if (!BASE64_IMAGE_PATTERN.test(imageBase64)) {
    return { valid: false, error: 'Неверный формат изображения. Поддерживаются: PNG, JPEG, WebP' };
  }
  
  return { valid: true };
}

function validateHexColor(color: unknown): boolean {
  if (!color || typeof color !== 'string') return false;
  return HEX_COLOR_PATTERN.test(color);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Неверный формат запроса' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64, wallColor, ceilingColor, floorColor, ceilingMoldingColor, floorMoldingColor } = body;
    
    // Validate image
    const imageValidation = validateImageBase64(imageBase64);
    if (!imageValidation.valid) {
      return new Response(
        JSON.stringify({ error: imageValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check that at least one surface is enabled
    const hasWall = validateHexColor(wallColor);
    const hasCeiling = validateHexColor(ceilingColor);
    const hasFloor = validateHexColor(floorColor);
    const hasCeilingMolding = validateHexColor(ceilingMoldingColor);
    const hasFloorMolding = validateHexColor(floorMoldingColor);

    if (!hasWall && !hasCeiling && !hasFloor && !hasCeilingMolding && !hasFloorMolding) {
      return new Response(
        JSON.stringify({ error: 'Выберите хотя бы одну поверхность для покраски' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Сервис временно недоступен. Не настроен API ключ.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image with surfaces:', { 
      wallColor: hasWall ? wallColor : 'skip', 
      ceilingColor: hasCeiling ? ceilingColor : 'skip', 
      floorColor: hasFloor ? floorColor : 'skip',
      ceilingMoldingColor: hasCeilingMolding ? ceilingMoldingColor : 'skip',
      floorMoldingColor: hasFloorMolding ? floorMoldingColor : 'skip',
      imageSize: (imageBase64 as string).length 
    });

    // Build dynamic prompt based on enabled surfaces
    const surfaceInstructions: string[] = [];
    const skipInstructions: string[] = [];

    if (hasCeiling) {
      surfaceInstructions.push(`1) CEILING: repaint the entire ceiling surface to SOLID ${ceilingColor}. Remove any texture or patterns.`);
    } else {
      skipInstructions.push('ceiling');
    }

    if (hasCeilingMolding) {
      surfaceInstructions.push(`2) CEILING MOLDINGS/CROWN MOLDINGS: repaint ALL ceiling trim, crown moldings, cornices to SOLID ${ceilingMoldingColor}.`);
    } else {
      skipInstructions.push('ceiling moldings/crown moldings');
    }

    if (hasWall) {
      surfaceInstructions.push(`3) WALLS: repaint EVERY visible wall surface to SOLID ${wallColor}. Includes painted walls, wallpaper, wall tiles. Remove patterns/prints entirely.`);
    } else {
      skipInstructions.push('walls');
    }

    if (hasFloorMolding) {
      surfaceInstructions.push(`4) FLOOR BASEBOARDS/SKIRTING BOARDS: repaint ALL floor baseboards, skirting boards, floor trim to SOLID ${floorMoldingColor}.`);
    } else {
      skipInstructions.push('floor baseboards/skirting boards');
    }

    if (hasFloor) {
      surfaceInstructions.push(`5) FLOOR: repaint the entire floor covering to SOLID ${floorColor}. Includes laminate, parquet, tiles, carpet, wood. Remove patterns/wood grain entirely.`);
    } else {
      skipInstructions.push('floor');
    }

    const prompt = `You are a professional interior design photo editor specializing in architectural surface repainting.

TASK: Repaint ONLY the specified architectural surfaces with SOLID colors while preserving natural lighting and shadows.

SURFACES TO REPAINT (apply exact HEX colors as flat solid fill):
${surfaceInstructions.join('\n')}

${skipInstructions.length > 0 ? `DO NOT REPAINT these surfaces (keep original): ${skipInstructions.join(', ')}` : ''}

CRITICAL — PRESERVE THESE OBJECTS UNCHANGED (never repaint):
- Furniture (sofas, chairs, tables, beds, cabinets, wardrobes, shelves, desks)
- Doors and door frames
- Windows and window frames  
- Curtains and blinds
- Decorations, paintings, mirrors
- Appliances, plants, all small objects

SEGMENTATION RULES:
- Be aggressive in identifying architectural surfaces vs objects
- If a surface edge touches furniture, repaint the architectural surface up to the edge
- The result MUST clearly show the specified surfaces recolored with flat solid colors
- Remove any texture, pattern, or grain from repainted surfaces

OUTPUT: Return only the final edited image with the specified surfaces recolored.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-pro-image-preview',
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'You are an expert photo editor. You MUST repaint the specified architectural surfaces to the exact HEX colors provided. Use solid flat colors. Preserve all furniture and objects unchanged. Be thorough - repaint ALL of each specified surface type.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: imageBase64 as string }
                }
              ]
            }
          ],
          modalities: ['image', 'text']
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI Gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Слишком много запросов. Подождите немного и попробуйте снова.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Необходимо пополнить баланс Lovable AI.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Ошибка при обработке изображения' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Lovable AI Gateway response received');
      
      let generatedImage: string | null = null;
      let textResponse: string | null = null;
      
      const message = data.choices?.[0]?.message;
      if (message) {
        textResponse = message.content;
        if (message.images && message.images.length > 0) {
          generatedImage = message.images[0]?.image_url?.url;
        }
      }

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

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Превышено время ожидания. Попробуйте изображение меньшего размера.' }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Произошла ошибка при обработке запроса' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
