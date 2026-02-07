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

function validateHexColor(color: unknown, name: string): { valid: boolean; error?: string } {
  if (!color || typeof color !== 'string') {
    return { valid: false, error: `Цвет ${name} не указан` };
  }
  
  if (!HEX_COLOR_PATTERN.test(color)) {
    return { valid: false, error: `Неверный формат цвета ${name}. Используйте HEX формат (#RRGGBB)` };
  }
  
  return { valid: true };
}

// Extract base64 data without the data URI prefix
function extractBase64Data(dataUri: string): string {
  const match = dataUri.match(/^data:image\/[^;]+;base64,(.+)$/);
  return match ? match[1] : dataUri;
}

// Get MIME type from data URI
function getMimeType(dataUri: string): string {
  const match = dataUri.match(/^data:(image\/[^;]+);base64,/);
  return match ? match[1] : 'image/jpeg';
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

    const { imageBase64, wallColor, ceilingColor, floorColor } = body;
    
    // Validate image
    const imageValidation = validateImageBase64(imageBase64);
    if (!imageValidation.valid) {
      return new Response(
        JSON.stringify({ error: imageValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate colors
    const colorValidations = [
      validateHexColor(wallColor, 'стен'),
      validateHexColor(ceilingColor, 'потолка'),
      validateHexColor(floorColor, 'пола'),
    ];

    for (const validation of colorValidations) {
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: validation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Сервис временно недоступен. Не настроен API ключ.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image with colors:', { 
      wallColor, 
      ceilingColor, 
      floorColor,
      imageSize: (imageBase64 as string).length 
    });

    const prompt = `You are a professional interior design photo editor.

TASK
Repaint ALL architectural surfaces in the room photo with SOLID colors while preserving natural lighting/shadows.

YOU MUST REPAINT (do not skip):
1) WALLS: repaint EVERY visible wall surface to ${wallColor}.
   - Includes painted walls, wallpaper, wall tiles.
   - Remove patterns/prints: replace with a flat solid color.
2) CEILING: repaint the entire ceiling to ${ceilingColor}.
3) FLOOR: repaint the entire floor covering to ${floorColor}.
   - Includes laminate/parquet/tiles/carpet/wood.
   - Remove patterns/wood grain: replace with a flat solid color.

CRITICAL — DO NOT EDIT these objects (keep original colors/materials):
- Furniture (sofas, chairs, tables, beds, cabinets, wardrobes, shelves, desks)
- Doors and door frames
- Windows and window frames
- Curtains and blinds
- Decorations, paintings, mirrors
- Appliances, plants, all small objects

IMPORTANT SEGMENTATION RULES
- Prioritize repainting WALLS and FLOOR even if edges touch furniture.
- If unsure about a boundary: repaint the architectural surface and keep objects intact as best as possible.
- The result must clearly show WALLS, CEILING, and FLOOR recolored. Do not leave any of these surfaces in original color.

OUTPUT
Return only the final edited image.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for image generation

    try {
      // Use Lovable AI Gateway with Nano Banana model for image generation
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You edit photos. Follow the user instructions exactly. Edit ONLY architectural surfaces; never recolor furniture/objects. Always recolor walls, ceiling, and floor as requested.',
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
      
      // Extract image from Lovable AI Gateway response
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
