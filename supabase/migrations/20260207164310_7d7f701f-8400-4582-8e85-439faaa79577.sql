-- Add discount fields to products table
ALTER TABLE public.products 
ADD COLUMN discount_percentage integer DEFAULT 0,
ADD COLUMN original_price numeric DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.products.original_price IS 'Original price before discount';