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
    const { imageBase64, style } = await req.json();
    
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

    console.log('Analyzing room for color suggestions, style:', style);

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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
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
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Слишком много запросов. Подождите немного.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Требуется пополнение баланса для AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Ошибка AI сервиса' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

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
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return new Response(
        JSON.stringify({ error: 'Не удалось обработать ответ AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(suggestions),
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
