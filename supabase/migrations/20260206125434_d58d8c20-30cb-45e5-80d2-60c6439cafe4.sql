-- Add rating column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;

-- Add payment_method column to orders table  
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod';

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public read access
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

-- Create storage policy for admin upload
CREATE POLICY "Anyone can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products');

-- Create storage policy for admin update
CREATE POLICY "Anyone can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products');

-- Create storage policy for admin delete
CREATE POLICY "Anyone can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products');