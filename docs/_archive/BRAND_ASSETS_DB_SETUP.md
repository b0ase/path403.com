# Brand Assets Database Setup

## Overview
This document contains the SQL schema for the brand assets management system. This system allows users to upload logos, set color palettes, and manage their brand identity across the b0ase.com platform.

## Schema

### 1. Create brand_assets table

```sql
-- Create brand_assets table
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Logo Assets
  primary_logo_url TEXT,
  inverted_logo_url TEXT,
  favicon_url TEXT,
  social_image_url TEXT,

  -- Color Palette (hex format)
  primary_color VARCHAR(7) DEFAULT '#000000' CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF' CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color VARCHAR(7) DEFAULT '#000000' CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  text_color VARCHAR(7) DEFAULT '#FFFFFF' CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color VARCHAR(7) DEFAULT '#FBBF24' CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),

  -- Typography (future use)
  heading_font VARCHAR(100),
  body_font VARCHAR(100),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS brand_assets_user_id_idx ON public.brand_assets(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_brand_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_brand_assets_updated_at
  BEFORE UPDATE ON public.brand_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_brand_assets_updated_at();
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own brand assets
CREATE POLICY "Users can view own brand assets"
  ON public.brand_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own brand assets (one per user)
CREATE POLICY "Users can insert own brand assets"
  ON public.brand_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own brand assets
CREATE POLICY "Users can update own brand assets"
  ON public.brand_assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own brand assets
CREATE POLICY "Users can delete own brand assets"
  ON public.brand_assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 3. Create Supabase Storage Bucket

```sql
-- Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true);

-- Storage policies: Users can upload to their own folder
CREATE POLICY "Users can upload brand assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies: Users can update their own brand assets
CREATE POLICY "Users can update brand assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies: Users can delete their own brand assets
CREATE POLICY "Users can delete brand assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies: Public read access to brand assets
CREATE POLICY "Public read access to brand assets"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'brand-assets');
```

## Setup Instructions

1. Open Supabase Studio
2. Navigate to the SQL Editor
3. Copy and paste the SQL above
4. Execute the queries in order
5. Verify the `brand_assets` table is created under the "Database" tab
6. Verify the `brand-assets` bucket is created under the "Storage" tab

## Table Schema Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| user_id | uuid | FOREIGN KEY, UNIQUE, NOT NULL | Reference to auth.users (one per user) |
| primary_logo_url | text | NULLABLE | URL to primary logo (light backgrounds) |
| inverted_logo_url | text | NULLABLE | URL to inverted logo (dark backgrounds) |
| favicon_url | text | NULLABLE | URL to favicon |
| social_image_url | text | NULLABLE | URL to social media OG image |
| primary_color | varchar(7) | DEFAULT '#000000', CHECK hex | Main brand color |
| secondary_color | varchar(7) | DEFAULT '#FFFFFF', CHECK hex | Accent color |
| background_color | varchar(7) | DEFAULT '#000000', CHECK hex | Default background |
| text_color | varchar(7) | DEFAULT '#FFFFFF', CHECK hex | Default text color |
| accent_color | varchar(7) | DEFAULT '#FBBF24', CHECK hex | CTA/warning color |
| heading_font | varchar(100) | NULLABLE | Future: heading font family |
| body_font | varchar(100) | NULLABLE | Future: body font family |
| created_at | timestamptz | NOT NULL | Timestamp when created |
| updated_at | timestamptz | NOT NULL | Timestamp when last updated |

## API Endpoints

After running this SQL, the following API endpoints will be functional:

- `POST /api/brand-assets/upload` - Upload brand asset (logo, favicon, etc.)
- `GET /api/brand-assets` - Fetch user's brand assets
- `PATCH /api/brand-assets` - Update brand colors or other fields
- `DELETE /api/brand-assets/[asset_type]` - Delete specific asset

## File Storage Structure

Files are stored in Supabase Storage with the following structure:

```
brand-assets/
  {user_id}/
    primary-logo.{ext}
    inverted-logo.{ext}
    favicon.{ext}
    social-image.{ext}
```

## Supported File Types

- **Logos**: SVG (preferred), PNG
- **Favicon**: ICO, PNG (16x16, 32x32, 48x48)
- **Social Image**: PNG, JPG (1200x630 recommended)
- **Max file size**: 5MB per file

## Color Format Validation

All color fields must be valid hex color codes:
- Format: `#RRGGBB`
- Example: `#FBBF24`, `#000000`, `#FFFFFF`
- Case insensitive: `#fbbf24` is valid
- Validated via CHECK constraint

## Default Colors

If no brand assets are set, the system falls back to:
- Primary: `#000000` (Black)
- Secondary: `#FFFFFF` (White)
- Background: `#000000` (Black)
- Text: `#FFFFFF` (White)
- Accent: `#FBBF24` (Warning Amber)
