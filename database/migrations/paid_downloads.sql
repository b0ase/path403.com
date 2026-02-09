-- Paid Downloads Migration
-- MoneyButton pay-to-download marketplace for b0ase.com
-- Created: 2026-01-31

-- ============================================================================
-- PAID DOWNLOADS TABLE
-- Stores file listings with pricing and seller info
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.paid_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File information
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) UNIQUE NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,

  -- Listing details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL CHECK (price_usd >= 0.01),

  -- Seller information
  seller_email VARCHAR(255) NOT NULL,
  seller_handcash VARCHAR(100) NOT NULL,

  -- Stats
  download_count INT DEFAULT 0,
  total_earnings_usd DECIMAL(15, 2) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_paid_downloads_status ON public.paid_downloads(status);
CREATE INDEX IF NOT EXISTS idx_paid_downloads_seller ON public.paid_downloads(seller_email);
CREATE INDEX IF NOT EXISTS idx_paid_downloads_created ON public.paid_downloads(created_at DESC);

-- ============================================================================
-- PAID DOWNLOAD PURCHASES TABLE
-- Records each purchase with download tokens
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.paid_download_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to listing
  download_id UUID NOT NULL REFERENCES public.paid_downloads(id) ON DELETE CASCADE,

  -- Buyer info
  buyer_email VARCHAR(255),
  buyer_handcash VARCHAR(100) NOT NULL,

  -- Payment details
  amount_usd DECIMAL(10, 2) NOT NULL,
  handcash_txid VARCHAR(100) NOT NULL,
  seller_amount DECIMAL(10, 2) NOT NULL,
  platform_amount DECIMAL(10, 2) NOT NULL,

  -- Download access
  download_token VARCHAR(100) UNIQUE NOT NULL,
  download_count INT DEFAULT 0,
  max_downloads INT DEFAULT 5,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_purchases_download ON public.paid_download_purchases(download_id);
CREATE INDEX IF NOT EXISTS idx_purchases_token ON public.paid_download_purchases(download_token);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON public.paid_download_purchases(buyer_handcash);
CREATE INDEX IF NOT EXISTS idx_purchases_expires ON public.paid_download_purchases(expires_at);

-- ============================================================================
-- STORAGE BUCKET (Private)
-- Files are not publicly accessible - requires signed URLs
-- ============================================================================

-- Create private bucket for paid downloads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'paid-downloads',
  'paid-downloads',
  false,
  524288000, -- 500MB max file size
  ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/octet-stream', 'text/plain', 'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 524288000;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.paid_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_download_purchases ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
DROP POLICY IF EXISTS "Anyone can view active downloads" ON public.paid_downloads;
CREATE POLICY "Anyone can view active downloads" ON public.paid_downloads
  FOR SELECT USING (status = 'active');

-- Sellers can manage their own listings (by email match - handled at API level)
-- Note: For now, we'll handle seller auth at API level since we don't have user_id

-- Anyone can view their own purchases (by token or handcash handle)
DROP POLICY IF EXISTS "Buyers can view own purchases" ON public.paid_download_purchases;
CREATE POLICY "Buyers can view own purchases" ON public.paid_download_purchases
  FOR SELECT USING (true); -- Controlled at API level with token validation

-- Service role can do everything
DROP POLICY IF EXISTS "Service role full access downloads" ON public.paid_downloads;
CREATE POLICY "Service role full access downloads" ON public.paid_downloads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access purchases" ON public.paid_download_purchases;
CREATE POLICY "Service role full access purchases" ON public.paid_download_purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Allow service role to upload/manage files
DROP POLICY IF EXISTS "Service role storage access" ON storage.objects;
CREATE POLICY "Service role storage access" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'paid-downloads')
  WITH CHECK (bucket_id = 'paid-downloads');

-- Allow authenticated users to upload (for upload API)
DROP POLICY IF EXISTS "Authenticated upload to paid-downloads" ON storage.objects;
CREATE POLICY "Authenticated upload to paid-downloads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'paid-downloads');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for paid_downloads
CREATE OR REPLACE FUNCTION update_paid_downloads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_paid_downloads_updated_at ON public.paid_downloads;
CREATE TRIGGER trigger_paid_downloads_updated_at
  BEFORE UPDATE ON public.paid_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_paid_downloads_updated_at();

-- Update download count and earnings on purchase
CREATE OR REPLACE FUNCTION update_download_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.paid_downloads
  SET
    download_count = download_count + 1,
    total_earnings_usd = total_earnings_usd + NEW.seller_amount
  WHERE id = NEW.download_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_download_stats ON public.paid_download_purchases;
CREATE TRIGGER trigger_update_download_stats
  AFTER INSERT ON public.paid_download_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_download_stats();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON public.paid_downloads TO service_role;
GRANT ALL ON public.paid_download_purchases TO service_role;
GRANT SELECT ON public.paid_downloads TO authenticated;
GRANT SELECT ON public.paid_download_purchases TO authenticated;
GRANT SELECT ON public.paid_downloads TO anon;
