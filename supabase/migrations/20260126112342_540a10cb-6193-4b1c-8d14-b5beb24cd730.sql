-- Fix security warning: set explicit search_path
CREATE OR REPLACE FUNCTION public.get_unique_palettes()
RETURNS TABLE (palette text, color_count bigint) 
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT palette, COUNT(*) as color_count
  FROM public.tints
  GROUP BY palette
  ORDER BY palette;
$$;