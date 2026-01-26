import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation helpers
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB base64 limit
const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/;
const VALID_STYLES = ['modern', 'scandinavian', 'classic', 'cozy', 'bold', 'natural'];

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

function validateStyle(style: unknown): { valid: boolean; value: string } {
  if (!style || typeof style !== 'string' || !VALID_STYLES.includes(style)) {
    return { valid: true, value: 'modern' }; // Default to 'modern' if invalid
  }
  return { valid: true, value: style };
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

    const { imageBase64, style: rawStyle } = body;
    
    // Validate image
    const imageValidation = validateImageBase64(imageBase64);
    if (!imageValidation.valid) {
      return new Response(
        JSON.stringify({ error: imageValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize style
    const styleValidation = validateStyle(rawStyle);
    const style = styleValidation.value;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Сервис временно недоступен. Не настроен API ключ.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing room for color suggestions:', { 
      style, 
      imageSize: (imageBase64 as string).length 
    });

    const stylePrompts: Record<string, string> = {
      modern: "современный минималистичный стиль с нейтральными тонами и акцентами",
      scandinavian: "скандинавский стиль - светлые, воздушные цвета, белый, серый, натуральное дерево",
      classic: "классический элегантный стиль - благородные насыщенные тона",
      cozy: "уютный тёплый стиль - мягкие пастельные и тёплые оттенки",
      bold: "смелый яркий дизайн с контрастными акцентными цветами",
      natural: "природные натуральные оттенки - зелёные, коричневые, бежевые тона"
    };

    const styleDescription = stylePrompts[style] || stylePrompts.modern;

    const prompt = `Ты профессиональный дизайнер интерьеров. Проанализируй это фото комнаты и предложи 3 варианта цветовых решений в стиле: ${styleDescription}.

Для каждого варианта укажи:
1. Название палитры (креативное, на русском)
2. Краткое описание (1-2 предложения, почему эти цвета подходят)
3. HEX-код цвета для ПОТОЛКА
4. HEX-код цвета для СТЕН
5. HEX-код цвета для ПОЛА

Учитывай:
- Существующую мебель и декор на фото
- Освещение в комнате
- Размер помещения (светлые цвета для маленьких, можно темнее для больших)
- Гармонию между всеми элементами

Ответь СТРОГО в формате JSON (и только JSON, без markdown):
{
  "analysis": "Краткий анализ комнаты (2-3 предложения)",
  "palettes": [
    {
      "name": "Название палитры",
      "description": "Описание",
      "ceiling": "#HEXCODE",
      "walls": "#HEXCODE",
      "floor": "#HEXCODE"
    }
  ]
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Google Gemini API direct call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
              responseMimeType: "application/json"
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
            JSON.stringify({ error: 'Слишком много запросов. Подождите немного.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 403) {
          return new Response(
            JSON.stringify({ error: 'Ошибка доступа к API. Проверьте ключ Gemini API.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Ошибка AI сервиса' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      console.log('Gemini response received');

      if (!content) {
        return new Response(
          JSON.stringify({ error: 'AI не вернул ответ' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse JSON from response (handle potential markdown wrapping)
      let suggestions;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
          
          // Validate the response structure
          if (!suggestions.analysis || !Array.isArray(suggestions.palettes)) {
            throw new Error('Invalid response structure');
          }
          
          // Validate each palette has required fields with correct format
          const hexPattern = /^#[0-9A-Fa-f]{6}$/;
          for (const palette of suggestions.palettes) {
            if (!palette.name || !palette.description || !palette.ceiling || !palette.walls || !palette.floor) {
              throw new Error('Missing palette fields');
            }
            if (!hexPattern.test(palette.ceiling) || !hexPattern.test(palette.walls) || !hexPattern.test(palette.floor)) {
              throw new Error('Invalid color format in palette');
            }
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parse/validation error:', parseError);
        return new Response(
          JSON.stringify({ error: 'Не удалось обработать ответ AI. Попробуйте ещё раз.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(suggestions),
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
