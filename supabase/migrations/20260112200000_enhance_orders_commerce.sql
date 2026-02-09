-- Enhance orders table for 1/3-1/3-1/3 payment structure
-- Adds payment schedule tracking, delivery dates, and margin protection

-- Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS elevated_price DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_payment_due_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_weeks_min INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_weeks_max INTEGER;

-- Create product packages table
CREATE TABLE IF NOT EXISTS product_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tagline TEXT,
  package_type TEXT NOT NULL CHECK (package_type IN ('component', 'content')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of included item IDs/slugs
  features JSONB DEFAULT '[]'::jsonb,  -- Array of feature strings
  base_price DECIMAL(10,2) NOT NULL,
  elevated_price DECIMAL(10,2) NOT NULL,  -- base_price * 1.25
  discount_percentage INTEGER DEFAULT 0,
  delivery_weeks_min INTEGER NOT NULL DEFAULT 2,
  delivery_weeks_max INTEGER NOT NULL DEFAULT 4,
  complexity TEXT DEFAULT 'Intermediate' CHECK (complexity IN ('Basic', 'Intermediate', 'Advanced', 'Enterprise')),
  icon TEXT,  -- Icon name for display
  color TEXT DEFAULT 'cyan',  -- Accent color
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment transactions table for tracking individual payments
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'delivery', 'final')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_method TEXT,  -- 'stripe', 'crypto_btc', 'crypto_eth', etc.
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,  -- External payment provider transaction ID
  payment_address TEXT,  -- For crypto payments
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_packages_type ON product_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_product_packages_active ON product_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_product_packages_slug ON product_packages(slug);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(estimated_delivery_date);

-- Enable RLS
ALTER TABLE product_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages (public read)
CREATE POLICY "Packages viewable by everyone"
  ON product_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Packages manageable by service role"
  ON product_packages FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Payment transactions manageable by service role"
  ON payment_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Insert initial component packages
INSERT INTO product_packages (slug, name, tagline, description, package_type, items, features, base_price, elevated_price, discount_percentage, delivery_weeks_min, delivery_weeks_max, complexity, icon, color, is_featured)
VALUES
  ('startup-bundle', 'Startup Bundle', 'Everything you need to launch', 'Complete foundation for your startup including admin dashboard, authentication, and payment processing.', 'component', '["admin-dashboard", "authentication", "payment-system"]', '["React Admin Dashboard", "Secure Authentication with 2FA", "Stripe/Crypto Payment Integration", "User Management", "Role-based Access Control"]', 1280, 1600, 20, 4, 6, 'Intermediate', 'FiPackage', 'cyan', true),

  ('ecommerce-complete', 'E-commerce Complete', 'Full online store solution', 'Everything needed to run a professional e-commerce operation from storefront to fulfillment.', 'component', '["ecommerce-store", "payment-system", "inventory-management", "analytics-dashboard"]', '["Full E-commerce Storefront", "Multi-gateway Payment Processing", "Real-time Inventory Tracking", "Sales Analytics & Reporting", "Customer Management", "Order Fulfillment System"]', 2400, 3000, 15, 6, 10, 'Advanced', 'FiShoppingCart', 'green', true),

  ('ai-suite', 'AI Suite', 'Intelligent automation package', 'Comprehensive AI integration including chatbot, custom AI agents, and intelligent analytics.', 'component', '["ai-chatbot", "ai-agent-builder", "analytics-dashboard"]', '["Custom AI Chatbot", "AI Agent Development", "Intelligent Analytics", "Natural Language Processing", "Automated Responses", "Learning & Adaptation"]', 2800, 3500, 10, 5, 8, 'Advanced', 'FiCpu', 'purple', true),

  ('enterprise-security', 'Enterprise Security', 'Bank-grade security suite', 'Complete security infrastructure for enterprises requiring the highest levels of protection.', 'component', '["authentication", "two-factor-auth", "encryption-module", "audit-logging"]', '["Multi-factor Authentication", "End-to-end Encryption", "Comprehensive Audit Logging", "Role-based Access Control", "Security Monitoring", "Compliance Ready"]', 1800, 2250, 15, 4, 6, 'Enterprise', 'FiShield', 'red', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert initial content packages
INSERT INTO product_packages (slug, name, tagline, description, package_type, items, features, base_price, elevated_price, discount_percentage, delivery_weeks_min, delivery_weeks_max, complexity, icon, color, is_featured)
VALUES
  ('content-starter', 'Content Starter', 'Kickstart your content', 'Perfect for businesses just starting their content journey. Includes blog posts and social media content.', 'content', '["blog-articles", "social-media-content"]', '["10 SEO-optimized Blog Posts", "20 Social Media Posts", "Content Calendar", "Hashtag Research", "Basic Analytics Report"]', 640, 800, 20, 2, 3, 'Basic', 'FiEdit3', 'blue', true),

  ('brand-launch', 'Brand Launch', 'Complete brand content kit', 'Everything you need to launch your brand online with professional copy and content.', 'content', '["website-copy", "blog-articles", "email-campaigns"]', '["Full Website Copy (5 pages)", "5 Blog Articles", "Email Welcome Sequence", "Social Media Bios", "Brand Voice Guide"]', 960, 1200, 20, 2, 4, 'Intermediate', 'FiStar', 'orange', true),

  ('full-content-suite', 'Full Content Suite', 'Complete content solution', 'Comprehensive content package covering all channels and formats for established businesses.', 'content', '["website-copy", "blog-articles", "email-campaigns", "social-media-content", "video-scripts"]', '["Full Website Copy", "15 Blog Articles", "Email Marketing Campaigns", "Social Media Content (30 posts)", "Video Scripts (5)", "Infographics (3)", "Monthly Content Strategy"]', 2400, 3000, 15, 4, 6, 'Advanced', 'FiLayers', 'pink', true),

  ('monthly-retainer', 'Monthly Retainer', 'Ongoing content partnership', 'Consistent, high-quality content delivered monthly to keep your brand active and engaging.', 'content', '["blog-articles", "social-media-content", "email-campaigns"]', '["4 Blog Articles/month", "20 Social Posts/month", "2 Email Campaigns/month", "Content Strategy Updates", "Performance Reports", "Priority Support"]', 1200, 1500, 0, 1, 1, 'Intermediate', 'FiRefreshCw', 'cyan', false)
ON CONFLICT (slug) DO NOTHING;

-- Comments
COMMENT ON TABLE product_packages IS 'Pre-configured bundles of components or content services';
COMMENT ON TABLE payment_transactions IS 'Individual payment records for the 1/3-1/3-1/3 payment structure';
COMMENT ON COLUMN orders.elevated_price IS 'Base price with 25% margin protection (base_price * 1.25)';
COMMENT ON COLUMN orders.deposit_amount IS 'First payment: 1/3 of elevated_price, due at order';
COMMENT ON COLUMN orders.delivery_amount IS 'Second payment: 1/3 of elevated_price, due on delivery';
COMMENT ON COLUMN orders.final_amount IS 'Final payment: 1/3 of elevated_price, due 30 days after delivery';
