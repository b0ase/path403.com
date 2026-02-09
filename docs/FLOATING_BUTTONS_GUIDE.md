# Floating Buttons System Guide

> Extensible infrastructure for rendering floating action buttons on any page with animations, physics, and investment modals.

## Overview

The floating button system provides a reusable pattern for adding animated, context-aware buttons that float on page corners or animate around the viewport. Each button is:

- **Self-contained**: Each float component includes its button design + investment modal
- **Portal-rendered**: Uses `createPortal()` to render outside container constraints
- **Conditional**: Pages opt-in via simple slug/slug matching arrays
- **Investable**: Buttons open modals with tier-based investment options
- **Linked**: Tier selection redirects to product pages with investment query parameters

## Quick Start: Add a Floating Button to Any Page

### 1. Create a Float Component

Create a new file: `components/blog/{ProjectName}Float.tsx`

**Template (Simple Image Button):**
```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {ProjectName}Button from '@/components/{ProjectName}Button';

export default function {ProjectName}Float() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const floatButton = (
    <motion.div
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '48px',
        zIndex: 9999,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <{ProjectName}Button size={90} showGlow />
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(floatButton, document.body);
}
```

### 2. Update the Parent Page

**For blog posts** (`app/blog/[slug]/page.tsx`):

```typescript
// Add to imports
import {ProjectName}Float from '@/components/blog/{ProjectName}Float';

// Add to post list constants at top
const {PROJECT_NAME}_POSTS = ['post-slug-1', 'post-slug-2'];

// In JSX at root level (outside <article>)
{{{PROJECT_NAME}_POSTS.includes(slug) && <{ProjectName}Float />}}
```

**For other pages** (portfolio, etc.):

```typescript
// Add conditional render at root level
{project.slug === '{project-slug}' && <{ProjectName}Float />}
```

### 3. (Optional) Create a Button Component

If you need a reusable button outside the float:

Create: `components/{ProjectName}Button.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {ProjectName}PurchaseModal from './{ProjectName}PurchaseModal';

interface {ProjectName}ButtonProps {
  size?: number;
  showGlow?: boolean;
  className?: string;
  initialAmount?: number;
  totalValuation?: number;
  totalRaised?: number;
}

export default function {ProjectName}Button({
  size = 90,
  showGlow = true,
  className = '',
  initialAmount = 100,
  totalValuation = 10000000,
  totalRaised = 1000,
}: {ProjectName}ButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        className={`cursor-pointer inline-block ${className}`}
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
          style={showGlow ? {
            boxShadow: '0 0 20px rgba(247, 147, 26, 0.5), 0 0 40px rgba(247, 147, 26, 0.3)',
          } : undefined}
        >
          <Image
            src="/images/clientprojects/{project-slug}/button.png"
            alt="{Project} Token"
            fill
            className="object-cover rounded-full"
          />
        </div>
      </motion.div>

      <{ProjectName}PurchaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialAmount={initialAmount}
        tokenTicker="${token}"
        totalValuation={totalValuation}
        totalRaised={totalRaised}
      />
    </>
  );
}
```

## Existing Floating Buttons

### 1. BitcoinWriterFloat

**Location:** `components/blog/BitcoinWriterFloat.tsx`

**Style:** Image-based button (90px, fixed bottom-right)

**Used on:**
- Blog post: "introduction-to-bitcoin-writer"
- Portfolio page: `/portfolio/bitcoin-writer`

**Features:**
- Orange glow effect
- Simple scale animation on load
- Opens `BWriterPurchaseModal` with investment tiers
- Redirects to `/portfolio/bitcoin-writer?invest={tokens}`

**Related files:**
- `components/BitcoinWriterButton.tsx` - Reusable button component
- `components/BWriterPurchaseModal.tsx` - Investment modal
- Image: `/images/clientprojects/bitcoin-writer/bitcoin-writer-button.png`

### 2. MoneyButtonFloat

**Location:** `components/blog/MoneyButtonFloat.tsx`

**Style:** Custom glossy dome design with gradient (purple/dark teal), text-based

**Used on:**
- Blog post: "moneybutton-path-to-10-million"

**Features:**
- Glossy 3D dome effect with CSS gradients
- "THE MONEY BUTTON $" text in yellow
- Pulsing glow animation
- 6 investment tiers ($0.01 - $100.00)
- Redirects to `/portfolio/moneybutton-store?invest={tokens}`

**Design notes:**
- Fully custom CSS (no image dependency)
- Good for branded/text-based buttons
- Easily customizable colors and gradients

### 3. BitcoinSpreadsheetsFloat

**Location:** `components/blog/BitcoinSpreadsheetsFloat.tsx`

**Style:** Image-based button with DVD-logo floating animation (80px)

**Used on:**
- Blog posts: Various finance/banking critique posts

**Features:**
- Bounces around viewport like classic DVD logo
- Pulsing emerald border ring
- Collision detection with viewport edges
- Opens investment panel with 5 tiers
- Redirects to `/portfolio/bitcoin-spreadsheets?invest={tokens}`

**Animation:** Physics-based movement with damping and velocity

### 4. NinjaPunkGirlsFloat

**Location:** `components/blog/NinjaPunkGirlsFloat.tsx`

**Style:** Gradient pink background with ninja star pattern overlay (80px)

**Used on:**
- Blog posts: Various posts

**Features:**
- "🥷 NPG Girls" text overlay
- Pulsing pink border ring
- Similar physics animation to BitcoinSpreadsheets
- Offset animation delay (different than BitcoinSpreadsheets)
- Opens investment panel with 6 tiers
- Redirects to `/portfolio/ninjapunkgirls-com?invest={tokens}`

## Component Architecture

### Portal Pattern (Hydration Safe)

All float components use this pattern to avoid hydration mismatches:

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
return createPortal(floatButton, document.body);
```

**Why:** Rendering at `document.body` via portal avoids CSS containment issues from parent `backdrop-blur` or `overflow: hidden` containers.

### Investment Modal Pattern

All modals follow a consistent tier structure:

```typescript
const investmentTiers = [
  { tokens: 1, pennies: 1, price: '$0.01', label: '1 Token', description: 'Try it out' },
  { tokens: 100, pennies: 10, price: '$0.10', label: '100 Tokens', description: 'Starter pack' },
  { tokens: 10000, pennies: 100, price: '$1.00', label: '10K Tokens', description: 'Early believer' },
  { tokens: 100000, pennies: 1000, price: '$10.00', label: '100K Tokens', description: 'Serious investor' },
  { tokens: 1000000, pennies: 10000, price: '$100.00', label: '1M Tokens', description: 'Whale mode' },
];
```

When a tier button is clicked:
1. Redirect to product page with query param: `/portfolio/{slug}?invest={tokens}`
2. Product page reads `invest` param
3. Modal auto-opens with pre-filled amount

## Related Pages

### /moneybuttons

**Purpose:** Canonical showcase of all available project buttons

**Features:**
- Physics-based button bouncing (desktop)
- CSS grid layout (mobile)
- Click → navigate to product page
- Money-themed "cha-ching" audio feedback

**File:** `app/moneybuttons/page.tsx`

### /tools/button-graphic-creator

**Purpose:** Design and download custom button graphics

**Features:**
- 8 style presets (Classic, Neon Green, Fire, Ocean, Sunset, Midnight, Gold, Silver)
- 4 shapes (Circle, Rounded, Pill, Hexagon)
- Customizable text, size, font, glow
- Download as 2x resolution PNG

**File:** `app/tools/button-graphic-creator/page.tsx`

### /buttons

**Purpose:** Directory/index of all available buttons

**File:** `app/buttons/page.tsx`

## Styling Guidelines

### Image-Based Buttons

- **Size:** 80-90px recommended
- **Format:** PNG with transparency
- **Glow:** `boxShadow: '0 0 20px rgba(R, G, B, 0.5), 0 0 40px rgba(R, G, B, 0.3)'`
- **Location:** `/images/clientprojects/{project-slug}/button.png`

### Custom-Designed Buttons (CSS)

- **Position:** `fixed`, `bottom: 40px`, `right: 48px`
- **Z-Index:** `9999`
- **Animations:** Framer Motion `whileHover`, `whileTap`
- **Colors:** Use project brand colors with gradients

### Floating Animations

**Simple (Default):**
```typescript
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.5, duration: 0.3 }}
```

**Physics-Based (DVD logo style):**
```typescript
// See BitcoinSpreadsheetsFloat.tsx for implementation
// Uses requestAnimationFrame for velocity/collision detection
```

## TODO: Button Redesign

> **Status:** Pending redesign (Jan 28, 2026)

**Current Issue:** Project buttons use image slugs that look inconsistent/poor quality.

**Required Work:**
- Redesign all project button graphics with consistent branding
- Options:
  1. Create custom CSS-based designs (like MoneyButtonFloat)
  2. Commission professional button graphics
  3. Use button-graphic-creator tool as baseline, customize per project
- Projects needing redesign:
  - Bitcoin Writer (currently: `/images/clientprojects/bitcoin-writer/bitcoin-writer-button.png`)
  - Bitcoin Spreadsheets
  - Ninja Punk Girls
  - MoneyButton Store
  - Any other project buttons

**Priority:** Medium (design/UX improvement, not blocking functionality)

**Implementation:** Once designs complete, update button image paths and styles in respective Float components and Button components.

## Checklist: Adding a New Floating Button

- [ ] Create `components/blog/{ProjectName}Float.tsx` using template
- [ ] Create `components/{ProjectName}Button.tsx` (if reusable)
- [ ] Create `components/{ProjectName}PurchaseModal.tsx` (if custom modal needed)
- [ ] Add import to parent page (`app/blog/[slug]/page.tsx` or similar)
- [ ] Add post/page slug to matching array
- [ ] Add conditional render: `{POSTS.includes(slug) && <{ProjectName}Float />}`
- [ ] Test float appears at bottom-right (or with custom animation)
- [ ] Test modal opens on button click
- [ ] Test tier buttons redirect to correct URL with query params
- [ ] Verify portal rendering (no CSS clipping issues)
- [ ] Add button image/asset to `/images/clientprojects/{slug}/`
- [ ] Update `.env.example` if new environment variables needed
- [ ] Document in this guide (new section under "Existing Floating Buttons")

## Files Reference

**Core Float Components:**
- `components/blog/BitcoinWriterFloat.tsx`
- `components/blog/MoneyButtonFloat.tsx`
- `components/blog/BitcoinSpreadsheetsFloat.tsx`
- `components/blog/NinjaPunkGirlsFloat.tsx`

**Button Components:**
- `components/BitcoinWriterButton.tsx`

**Modals:**
- `components/BWriterPurchaseModal.tsx`

**Pages:**
- `app/blog/[slug]/page.tsx` - Uses float components
- `app/portfolio/[slug]/page.tsx` - Uses float components
- `app/moneybuttons/page.tsx` - Button showcase
- `app/buttons/page.tsx` - Button directory
- `app/tools/button-graphic-creator/page.tsx` - Button creator

**Assets:**
- `/images/clientprojects/{slug}/button.png` - Button graphics

## Questions?

See related documentation:
- `CODEBASE_MAP.md` - Full architecture overview
- `COMPONENT_SPLITTING_GUIDE.md` - Component design patterns
- `BRAND_SYSTEM_SPEC.md` - Brand/styling guidelines
