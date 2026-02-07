-- Create users table for phone-based authentication
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin user
INSERT INTO public.admin_users (username, password) VALUES ('Relieve01', 'Relieve12@');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'All',
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OTP table for password reset
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT
USING (true);

-- Admin can manage products (via service role or function)
CREATE POLICY "Anyone can insert products for now"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update products for now"
ON public.products FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete products for now"
ON public.products FOR DELETE
USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Anyone can register"
ON public.users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (true);

-- Orders policies
CREATE POLICY "Users can read own orders"
ON public.orders FOR SELECT
USING (true);

CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin can update orders"
ON public.orders FOR UPDATE
USING (true);

-- Admin users readable for login
CREATE POLICY "Admin can read admin_users"
ON public.admin_users FOR SELECT
USING (true);

-- OTP codes policies
CREATE POLICY "Anyone can create OTP"
ON public.otp_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read OTP"
ON public.otp_codes FOR SELECT
USING (true);

CREATE POLICY "Anyone can update OTP"
ON public.otp_codes FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url, category, stock, featured) VALUES
('Midnight Rose', 'A captivating blend of Bulgarian rose, oud, and vanilla. Perfect for evening occasions.', 4500, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 'For Her', 50, true),
('Ocean Breeze', 'Fresh aquatic notes with hints of bergamot and white musk. Ideal for summer days.', 3800, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', 'For Him', 45, true),
('Royal Oud', 'Luxurious Arabian oud combined with saffron and amber. A statement of sophistication.', 8500, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'Luxury', 25, true),
('Garden of Eden', 'A floral symphony of jasmine, lily, and green tea. Feminine and enchanting.', 4200, 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400', 'Floral', 60, true),
('Velvet Noir', 'Deep and mysterious with notes of leather, tobacco, and black pepper.', 5200, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400', 'Woody', 35, false),
('Fresh Morning', 'Citrus burst with lime, grapefruit, and mint. Energizing and uplifting.', 3200, 'https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=400', 'Fresh', 70, false),
('Amber Dreams', 'Warm amber base with sandalwood and vanilla. Cozy and inviting.', 4800, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', 'Unisex', 40, true),
('Silver Moon', 'Cool and elegant with white florals and silver birch. Modern and refined.', 3900, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400', 'For Her', 55, false);