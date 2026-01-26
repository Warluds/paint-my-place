import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        .select('palette');
      
      if (error) throw error;
      
      // Get unique palettes
      const uniquePalettes = [...new Set(data?.map(t => t.palette) || [])];
      return uniquePalettes.sort();
    },
  });
};

export const useDeletePalette = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paletteName: string) => {
      const { error } = await supabase
        .from('tints')
        .delete()
        .eq('palette', paletteName);
      
      if (error) throw error;
      return paletteName;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tints'] });
      queryClient.invalidateQueries({ queryKey: ['palettes'] });
    },
  });
};
