-- Create banners table for homepage carousel
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  button_text TEXT DEFAULT 'Shop Now',
  button_link TEXT DEFAULT '/products',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Banners are publicly readable
CREATE POLICY "Banners are publicly readable"
ON public.banners
FOR SELECT
USING (true);

-- Admin can manage banners (for now, anyone can - will be restricted later)
CREATE POLICY "Anyone can insert banners for now"
ON public.banners
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update banners for now"
ON public.banners
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete banners for now"
ON public.banners
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for banners bucket
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Anyone can upload banner images for now"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Anyone can update banner images for now"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'banners');

CREATE POLICY "Anyone can delete banner images for now"
ON storage.objects
FOR DELETE
USING (bucket_id = 'banners');

-- Add guest_order field to orders table to track guest vs user orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;