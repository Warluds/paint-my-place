-- Create function to get unique palette names efficiently
CREATE OR REPLACE FUNCTION public.get_unique_palettes()
RETURNS TABLE (palette text, color_count bigint) 
LANGUAGE sql
STABLE
AS $$
  SELECT palette, COUNT(*) as color_count
  FROM public.tints
  GROUP BY palette
  ORDER BY palette;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.get_unique_palettes() TO anon;