import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RecolorResult {
  image: string;
  message?: string;
}

export const useRecolorRoom = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const recolorRoom = async (
    imageBase64: string,
    wallColor: string,
    ceilingColor: string,
    floorColor: string
  ) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke<RecolorResult>('recolor-room', {
        body: {
          imageBase64,
          wallColor,
          ceilingColor,
          floorColor
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось обработать изображение',
          variant: 'destructive'
        });
        return null;
      }

      if (data?.image) {
        setProcessedImage(data.image);
        toast({
          title: 'Готово!',
          description: data.message || 'Цвета успешно изменены'
        });
        return data.image;
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
        description: 'Произошла ошибка при обработке',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcessedImage = () => {
    setProcessedImage(null);
  };

  return {
    recolorRoom,
    isProcessing,
    processedImage,
    resetProcessedImage
  };
};
