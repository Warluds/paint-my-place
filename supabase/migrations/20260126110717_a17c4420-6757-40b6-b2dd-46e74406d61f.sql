-- Create tints table for color palettes
CREATE TABLE public.tints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hex_color TEXT NOT NULL,
  name TEXT NOT NULL,
  series TEXT,
  palette TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster palette filtering
CREATE INDEX idx_tints_palette ON public.tints(palette);
CREATE INDEX idx_tints_hex ON public.tints(hex_color);

-- Enable RLS
ALTER TABLE public.tints ENABLE ROW LEVEL SECURITY;

-- Public read access for tints
CREATE POLICY "Public read access for tints" 
ON public.tints 
FOR SELECT 
USING (true);