# b0ase.com Page Style Guide

This document defines the house style for all pages on b0ase.com. The reference implementation is `/portfolio`.

---

## Core Principles

1. **Full-width layout** - Content extends edge-to-edge with no max-width containers
2. **Sharp edges** - No rounded corners on cards, buttons, or containers
3. **Black background** - Pure black (`bg-black`) with white text
4. **Minimal decoration** - No gradients, glows, or shadows
5. **Typography-driven** - Large bold headlines create visual hierarchy

---

## Page Structure

```tsx
<motion.div className="min-h-screen bg-black text-white relative">
  <motion.section className="px-4 md:px-8 py-16 relative">
    <div className="w-full">
      {/* Page content */}
    </div>
  </motion.section>
</motion.div>
```

### Spacing
- **Horizontal padding**: `px-4 md:px-8` (16px mobile, 32px desktop)
- **Vertical padding**: `py-16` (64px top and bottom)
- **Section spacing**: `mb-12` between major sections

### DO NOT USE
- `max-w-*` containers (e.g., `max-w-6xl`, `max-w-4xl`)
- `mx-auto` centering
- `container` class

---

## Typography

### Page Header with Icon (Recommended)

This is the standard layout for content pages (e.g., `/agents`, `/careers`, `/projects`):

```tsx
<motion.div
  className="mb-12 border-b border-gray-800 pb-8"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.5 }}
>
  <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
    {/* Icon Box */}
    <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
      <FaIcon className="text-4xl md:text-6xl text-white" />
    </div>
    {/* Title + Subtitle */}
    <div className="flex items-end gap-4">
      <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
        PAGE TITLE
      </h1>
      <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
        SUBTITLE
      </div>
    </div>
  </div>

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <p className="text-gray-400 max-w-2xl">
      Page description explaining purpose and key features.
    </p>
    <div className="flex gap-4">
      <Link
        href="/secondary-action"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors whitespace-nowrap"
      >
        Secondary <FiArrowRight size={14} />
      </Link>
      <Link
        href="/primary-action"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
        style={{ backgroundColor: '#fff', color: '#000' }}
      >
        Primary CTA <FiArrowRight size={14} />
      </Link>
    </div>
  </div>
</motion.div>
```

### Key Header Elements

- **Icon Box**: `bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start`
- **Title**: `text-4xl md:text-6xl font-bold tracking-tighter`
- **Subtitle**: `text-xs text-gray-500 font-mono uppercase tracking-widest`
- **Description**: `text-gray-400 max-w-2xl`
- **Primary Button**: White background, black text, `px-4 py-2`
- **Secondary Button**: Border only, `border-zinc-700 text-zinc-300`
- **Bottom Border**: `border-b border-gray-800 pb-8 mb-12`

### Simple Page Title (Alternative)

For simpler pages without icon:

```tsx
<div className="mb-8 flex items-end gap-4 border-b border-zinc-900 pb-4">
  <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
    PAGE_TITLE
  </h2>
  <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
    SUBTITLE
  </div>
</div>
```

### Title Guidelines

- Titles are **uppercase** with underscores for compound names (e.g., `AGENT_CLI`, `USER_ACCOUNT`)
- Font size scales: `text-4xl` → `text-6xl`
- Use `tracking-tighter` on titles
- Subtitles use `text-xs font-mono uppercase tracking-widest text-zinc-500`
- Title and subtitle aligned with `flex items-end gap-4`
- Bottom border: `border-b border-zinc-900 pb-4`

### Section Headers
```tsx
<h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
  Section Title
</h3>
```

### Body Text
- Primary: `text-white`
- Secondary: `text-gray-400`
- Muted: `text-gray-500`

---

## Colors

| Purpose | Class |
|---------|-------|
| Background | `bg-black` |
| Primary text | `text-white` |
| Secondary text | `text-gray-400` |
| Muted text | `text-gray-500` |
| Borders | `border-gray-800` |
| Hover backgrounds | `bg-gray-900/50` |
| Success/Connected | `text-green-400`, `bg-green-900/50` |
| Warning | `text-yellow-400`, `bg-yellow-900/50` |
| Info/Link | `text-blue-400` |

---

## Tables

Tables are the preferred way to display lists of data.

```tsx
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-gray-800">
        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-800">
      <tr className="hover:bg-gray-900/50">
        <td className="px-4 py-4 text-sm">Content</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Table Rules
- Full width: `w-full`
- No outer border
- Header border: `border-b border-gray-800`
- Row dividers: `divide-y divide-gray-800`
- Hover state: `hover:bg-gray-900/50`
- Cell padding: `px-4 py-4`
- Header text: `text-gray-400 text-sm font-medium`

---

## Buttons & Links

### Primary Button (Action)
```tsx
<button className="px-3 py-1 bg-white text-black text-xs hover:bg-gray-200 transition-colors">
  Action
</button>
```

### Secondary Button
```tsx
<button className="px-3 py-1 bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors">
  Secondary
</button>
```

### Link Button
```tsx
<a className="px-3 py-1 bg-white text-black text-xs hover:bg-gray-200 transition-colors">
  View
</a>
```

### Button Rules
- **No rounded corners** - remove all `rounded-*` classes
- Small text: `text-xs`
- Compact padding: `px-3 py-1`
- Transitions: `transition-colors`

---

## Cards

Cards should be minimal with sharp edges.

```tsx
<div className="p-6 border border-gray-800 hover:border-gray-600 bg-black hover:bg-gray-900/50 transition-all">
  <h4 className="font-bold uppercase tracking-tight mb-2 text-white">Title</h4>
  <p className="text-gray-400 text-sm mb-4">Description text.</p>
  <span className="text-gray-500 text-xs uppercase tracking-widest">
    Call to action
  </span>
</div>
```

### Card Rules
- **No rounded corners**
- Border: `border border-gray-800`
- Hover border: `hover:border-gray-600`
- Background: `bg-black`
- Hover background: `hover:bg-gray-900/50`
- Padding: `p-6`

---

## Status Badges

```tsx
{/* Active/Live */}
<span className="px-2 py-1 text-xs bg-green-900/50 text-green-300">
  Live
</span>

{/* Pending/Development */}
<span className="px-2 py-1 text-xs bg-yellow-900/50 text-yellow-300">
  Development
</span>

{/* Inactive */}
<span className="px-2 py-1 text-xs bg-gray-800 text-gray-400">
  Inactive
</span>
```

---

## Icons

Use react-icons (`react-icons/fa`, `react-icons/fi`).

```tsx
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
```

Icon styling:
- Default: `text-gray-400`
- Hover: `hover:text-white`
- Size: `size={16}` for inline, `size={18}` for buttons

---

## Animations

Use Framer Motion for page transitions.

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
>
```

### Standard Transitions
- Page fade-in: `duration: 0.8`
- Content stagger: `delay: 0.4` to `delay: 0.5`
- Slide up: `initial={{ opacity: 0, y: 30 }}`

---

## Modals

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/80" onClick={onClose} />

  {/* Modal */}
  <div className="relative z-10 bg-black border border-gray-800 p-8 w-full max-w-md">
    <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
      Modal Title
    </h3>
    {/* Content */}
  </div>
</div>
```

### Modal Rules
- Backdrop: `bg-black/80`
- **No rounded corners** on modal
- Border: `border border-gray-800`
- Max width only on modal itself: `max-w-md`

---

## Form Inputs

```tsx
<input
  className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors font-mono"
  placeholder="Placeholder"
/>
```

### Input Rules
- Background: `bg-gray-900`
- Border: `border border-gray-800`
- Focus: `focus:border-gray-600`
- **No rounded corners**
- Monospace for values: `font-mono`

### Labels
```tsx
<label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
  Label Text
</label>
```

---

## Grid Layouts

For card grids:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

Gap: `gap-4` (16px)

---

## Anti-Patterns (DO NOT USE)

### Avoid These Classes
```
rounded-*          // No rounded corners
max-w-*           // No max-width containers (except modals)
mx-auto           // No centering
shadow-*          // No shadows
ring-*            // No rings
bg-gradient-*     // No gradients on backgrounds
from-* to-*       // No gradient colors
backdrop-blur-*   // No blur effects
```

### Avoid These Patterns
```tsx
// BAD: Centered container
<div className="max-w-6xl mx-auto">

// GOOD: Full width
<div className="w-full">

// BAD: Rounded card
<div className="rounded-3xl bg-zinc-900/50">

// GOOD: Sharp edges
<div className="border border-gray-800 bg-black">

// BAD: Gradient background
<div className="bg-[radial-gradient(...)]">

// GOOD: Solid background
<div className="bg-black">
```

---

## Reference Pages

These pages follow the house style correctly:

### With Icon Header (Recommended Pattern)
- `/agents` - AI Agents page (primary reference)
- `/careers` - Careers page
- `/projects` - Projects listing
- `/site-index` - Site index/sitemap

### Standard Layout
- `/portfolio` - Portfolio reference implementation
- `/user/account` - User dashboard
- `/gigs` - Gigs board
- `/exchange` - Token exchange
- `/developers` - Developer marketplace

---

## Checklist for New Pages

- [ ] Page uses `bg-black text-white`
- [ ] No `max-w-*` on main content
- [ ] Padding is `px-4 md:px-8 py-16`
- [ ] Title is `text-6xl md:text-8xl lg:text-9xl font-bold`
- [ ] Subtitle is `uppercase tracking-widest text-gray-400`
- [ ] No rounded corners anywhere
- [ ] Tables use `border-gray-800` dividers
- [ ] Buttons are sharp-edged with `bg-white text-black`
- [ ] No gradients or shadows
- [ ] Uses Framer Motion for animations
