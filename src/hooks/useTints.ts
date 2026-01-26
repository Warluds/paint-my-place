import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Tint {
  id: string;
  hex_color: string;
  name: string;
  series: string | null;
  palette: string;
}

export const useTints = (palette?: string) => {
  return useQuery({
    queryKey: ['tints', palette],
    queryFn: async () => {
      let query = supabase
        .from('tints')
        .select('*')
        .order('name');
      
      if (palette) {
        query = query.eq('palette', palette);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Tint[];
    },
  });
};

export const usePalettes = () => {
  return useQuery({
    queryKey: ['palettes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tints')
        .select('palette')
        .order('palette');
      
      if (error) throw error;
      
      // Get unique palettes
      const uniquePalettes = [...new Set(data?.map(t => t.palette) || [])];
      return uniquePalettes;
    },
  });
};
