-- Create Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  brand TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  specs TEXT,
  image TEXT,
  images TEXT[],
  tags TEXT[],
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public profiles are viewable by everyone." 
  ON products FOR SELECT 
  USING ( true );

-- Allow authenticated users (Admin) to insert/update/delete
CREATE POLICY "Admins can insert products" 
  ON products FOR INSERT 
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can update products" 
  ON products FOR UPDATE 
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can delete products" 
  ON products FOR DELETE 
  USING ( auth.role() = 'authenticated' );


-- Create Activity Logs Table for Admin Dashboard
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB,
  user_email TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view and insert logs" 
  ON activity_logs FOR ALL 
  USING ( auth.role() = 'authenticated' );


-- Create Orders Table (for E-commerce features)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all orders" 
  ON orders FOR SELECT 
  USING ( auth.role() = 'authenticated' );

-- Create Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all order items" 
  ON order_items FOR SELECT 
  USING ( auth.role() = 'authenticated' );
