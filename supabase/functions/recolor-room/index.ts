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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
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
- Keep the perspective and geometry unchanged

Generate the edited image.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for image generation

    try {
      // Direct Gemini API call with user's personal API key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: getMimeType(imageBase64 as string),
                      data: extractBase64Data(imageBase64 as string)
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"]
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Слишком много запросов. Подождите немного и попробуйте снова.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 403) {
          return new Response(
            JSON.stringify({ error: 'Ошибка доступа к API. Проверьте ваш Gemini API ключ.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Ошибка при обработке изображения' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Gemini API response received');
      
      // Extract image from Gemini response
      let generatedImage: string | null = null;
      let textResponse: string | null = null;
      
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          generatedImage = `data:${mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }

      if (!generatedImage) {
        console.error('No image in Gemini response:', JSON.stringify(data));
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
