# Brand System Specification

**Last Updated**: 2026-01-19
**Status**: Phases 1-2 Complete, Phase 3 Partial

## Overview

The brand tab at `/user/account?tab=brand` needs to be transformed from static placeholder content into a dynamic brand asset management system. Assets uploaded here will dictate how a user's brand appears across the site, including their `/public/client/[name]` page and project displays.

## Current State

**Location:** `app/user/account/page.tsx` lines 2961-3024

**Current Issues:**
- Hardcoded "Warning Amber" color (#FBBF24) - generic and not dynamic
- Static placeholder logos ("LOGO" text)
- No upload functionality
- No database storage for brand assets
- No brand preview system

## Requirements

### 1. Brand Asset Upload

Users should be able to upload:
- **Primary Logo** (SVG, PNG) - for light backgrounds
- **Inverted Logo** (SVG, PNG) - for dark backgrounds
- **Favicon** (ICO, PNG)
- **Social Media Image** (PNG, JPG) - OG image for sharing

**File Requirements:**
- Max size: 5MB per file
- Formats: SVG (preferred), PNG, JPG, ICO
- Storage: Supabase Storage bucket `brand-assets`

### 2. Color Palette Management

Users should define their brand colors:
- **Primary Color** - Main brand color
- **Secondary Color** - Accent color
- **Background Color** - Default background
- **Text Color** - Default text
- **Accent/Warning Color** - Call-to-action, alerts

**Implementation:**
- Color picker component (hex input + visual picker)
- Preview of colors in use
- Export as CSS variables
- Save to database

### 3. Database Schema

```sql
CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Logo Assets
  primary_logo_url TEXT,
  inverted_logo_url TEXT,
  favicon_url TEXT,
  social_image_url TEXT,

  -- Color Palette
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  accent_color VARCHAR(7) DEFAULT '#FBBF24',

  -- Typography (future)
  heading_font VARCHAR(100),
  body_font VARCHAR(100),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own brand assets"
ON brand_assets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand assets"
ON brand_assets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand assets"
ON brand_assets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

### 4. API Endpoints

**Upload Brand Asset:**
```typescript
POST /api/brand-assets/upload
Body: FormData {
  file: File,
  assetType: 'primary_logo' | 'inverted_logo' | 'favicon' | 'social_image'
}
Response: { success: true, url: string }
```

**Update Brand Colors:**
```typescript
PATCH /api/brand-assets
Body: {
  primary_color?: string,
  secondary_color?: string,
  background_color?: string,
  text_color?: string,
  accent_color?: string
}
Response: { success: true, brandAssets: BrandAssets }
```

**Get Brand Assets:**
```typescript
GET /api/brand-assets
Response: { brandAssets: BrandAssets }
```

### 5. Brand Application

**User Pages:**
- `/public/client/[name]` - Uses user's uploaded logo, colors
- `/portfolio/[slug]` - Brand colors in theme
- `/mint/launch/[slug]` - Token launch page styling
- Any project showcase pages

**Dynamic Theming:**
```typescript
// Load user's brand assets
const brandAssets = await getBrandAssets(userId);

// Apply as CSS variables
<div style={{
  '--brand-primary': brandAssets.primary_color,
  '--brand-secondary': brandAssets.secondary_color,
  '--brand-accent': brandAssets.accent_color,
}}>
  {/* Content styled with brand colors */}
</div>
```

### 6. UI Components

**Brand Tab Layout:**
```
┌─────────────────────────────────────┐
│ Brand Assets          [Upload Asset]│
├─────────────────────────────────────┤
│                                     │
│ ┌────────────┐  ┌─────────────────┐│
│ │ Logos      │  │ Color Palette   ││
│ │            │  │                 ││
│ │ [Primary]  │  │ Primary: ⬛ #000 ││
│ │ [Inverted] │  │ Accent:  ⬜ #FBF ││
│ │            │  │ [Edit Colors]   ││
│ └────────────┘  └─────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Brand Preview                   ││
│ │ See how your brand looks across ││
│ │ different pages                 ││
│ │ [Preview] [Generate CSS]        ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Color Picker Component:**
- Hex input field with validation
- Visual color picker (hue/saturation grid)
- Recent colors
- Save/Cancel buttons

### 7. Brand Preview

Modal that shows brand applied to:
- Portfolio card
- Project card
- Token launch page mockup
- Public profile header

Allows users to see brand in context before saving.

### 8. Export Features

**Generate Brand Kit:**
- Download ZIP containing:
  - All logo files
  - `colors.css` with CSS variables
  - `brand-guide.md` with usage instructions
  - Color palette image

**Share Brand URL:**
- Public URL: `/brand/[username]`
- Shows logo, colors, usage guidelines
- Can be shared with designers, partners

## Implementation Phases

### Phase 1: Database & Storage ✅ COMPLETE
- ✅ Create `brand_assets` table
- ✅ Setup Supabase storage bucket
- ✅ Create RLS policies
- ✅ Test manual inserts

### Phase 2: Upload API ✅ COMPLETE
- ✅ Build `/api/brand-assets/upload` endpoint
- ✅ Implement file validation
- ✅ Test logo uploads
- ✅ Verify storage URLs work

### Phase 3: Color Management ⏳ PARTIAL
- ❌ Create color picker UI component
- ✅ Build `/api/brand-assets` PATCH endpoint
- ✅ Add color validation (hex format)
- ✅ Save/load colors from database

### Phase 4: Brand Application ❌ NOT STARTED
- ❌ Load brand assets in user pages
- ❌ Apply colors via CSS variables
- ❌ Test logo display
- ❌ Ensure fallbacks for missing assets

### Phase 5: Preview & Export ❌ NOT STARTED
- ❌ Build brand preview modal
- ❌ Generate CSS export
- ❌ Create brand guide PDF
- ❌ Public brand page

## Technical Considerations

**Performance:**
- Cache brand assets (60s TTL)
- Use CDN for logo delivery
- Lazy load preview modal

**Security:**
- Validate image files (not malware)
- Size limits on uploads
- RLS on brand_assets table
- Rate limit uploads

**UX:**
- Clear upload progress
- Image preview before save
- Drag & drop support
- Mobile-friendly color picker

**Accessibility:**
- Alt text for logos
- Color contrast warnings
- Keyboard navigation for picker

## Success Metrics

- [ ] Users can upload all 4 asset types
- [ ] Users can customize all 5 colors
- [ ] Brand assets display correctly on public pages
- [ ] Preview shows accurate representation
- [ ] Export generates valid CSS/files
- [ ] No broken images or color application

## Dependencies

- Supabase Storage (already configured)
- react-colorful or similar color picker library
- File validation utilities
- Image processing (sharp) for resizing

## Estimated Effort

- **Phase 1-2**: 8-12 hours
- **Phase 3-4**: 12-16 hours
- **Phase 5**: 8-12 hours
- **Total**: ~30-40 hours

## Notes

- Start with MVP: just logo upload + 3 colors
- Add more features incrementally
- Consider AI-generated brand suggestions
- Future: Font upload support
- Future: Animated logo support
- Future: Brand compliance checker
