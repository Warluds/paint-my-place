import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ColorPalette {
  name: string;
  description: string;
  ceiling: string;
  walls: string;
  floor: string;
}

export interface SuggestionsResult {
  analysis: string;
  palettes: ColorPalette[];
}

export const useSuggestColors = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsResult | null>(null);

  const suggestColors = async (imageBase64: string, style: string = 'modern') => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke<SuggestionsResult>('suggest-colors', {
        body: { imageBase64, style }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось проанализировать изображение',
          variant: 'destructive'
        });
        return null;
      }

      if (data?.palettes) {
        setSuggestions(data);
        toast({
          title: 'Анализ готов!',
          description: `Предложено ${data.palettes.length} варианта цветов`
        });
        return data;
      } else if (data && 'error' in data) {
        toast({
          title: 'Ошибка',
          description: (data as any).error,
          variant: 'destructive'
        });
        return null;
      }

      return null;
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при анализе',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions(null);
  };

  return {
    suggestColors,
    isAnalyzing,
    suggestions,
    clearSuggestions
  };
};
