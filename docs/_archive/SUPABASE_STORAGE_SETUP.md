# Supabase Storage Setup for Video Uploads

## Storage Bucket Creation

Run these commands in your Supabase Studio SQL editor:

### 1. Create Storage Bucket

```sql
-- Create storage bucket for content assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-assets', 'content-assets', true);

-- Set storage policies for content-assets bucket
CREATE POLICY "Authenticated users can upload content assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-assets');

CREATE POLICY "Authenticated users can update their content assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content-assets');

CREATE POLICY "Authenticated users can delete their content assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-assets');

CREATE POLICY "Public can view content assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-assets');
```

### 2. Create Content Assets Database Table

```sql
-- Create content_assets table
CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  asset_type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'image', 'document'
  title VARCHAR(500),
  description TEXT,
  tags TEXT[],
  duration INTEGER, -- For video/audio in seconds
  thumbnail_path TEXT,
  metadata JSONB,
  project_id UUID, -- Optional link to project
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'deleted'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_assets_user_id ON content_assets(user_id);
CREATE INDEX idx_content_assets_asset_type ON content_assets(asset_type);
CREATE INDEX idx_content_assets_status ON content_assets(status);
CREATE INDEX idx_content_assets_project_id ON content_assets(project_id);

-- Enable RLS
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own content assets"
ON content_assets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content assets"
ON content_assets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content assets"
ON content_assets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content assets"
ON content_assets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 3. Create Function to Update updated_at

```sql
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for content_assets
CREATE TRIGGER update_content_assets_updated_at
    BEFORE UPDATE ON content_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Storage Configuration

### Bucket Settings
- **Name**: `content-assets`
- **Public Access**: Yes (for serving videos/images)
- **File Size Limit**: 5GB per file (configurable in Supabase settings)
- **Allowed MIME types**: All (or restrict to video/*, image/*, audio/*)

### File Path Structure
```
content-assets/
├── {user_id}/
│   ├── videos/
│   │   ├── {filename}.mp4
│   │   └── {filename}.mov
│   ├── images/
│   │   └── {filename}.jpg
│   ├── audio/
│   │   └── {filename}.mp3
│   └── thumbnails/
│       └── {filename}_thumb.jpg
```

## Environment Variables

Add to `.env.local`:

```bash
# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage configuration
NEXT_PUBLIC_STORAGE_BUCKET=content-assets
MAX_FILE_SIZE=5368709120  # 5GB in bytes
```

## Testing Checklist

After running the SQL commands:

- [ ] Verify bucket `content-assets` exists in Supabase Studio > Storage
- [ ] Check storage policies are active
- [ ] Verify `content_assets` table exists in Database
- [ ] Test file upload via Supabase Studio
- [ ] Verify RLS policies work (can only see own files)
- [ ] Test public URL access to uploaded file

## Usage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('content-assets')
  .upload(`${userId}/videos/${fileName}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('content-assets')
  .getPublicUrl(filePath);

// Delete file
await supabase.storage
  .from('content-assets')
  .remove([filePath]);
```

## Storage Limits

Current: 500GB available
Recommended: Monitor usage via Supabase Dashboard

When approaching limit:
1. Add external storage (Cloudflare R2, S3)
2. Implement video compression
3. Archive old content
4. Upgrade storage capacity
