# Button Redesign TODO

**Status:** Pending
**Priority:** Medium (UX/Design improvement)
**Created:** 2026-01-28
**Updated:** 2026-01-28

## Overview

Current project buttons use image slugs that don't present a cohesive visual identity. This TODO tracks the redesign effort to create consistent, high-quality button graphics across all projects.

## Current State

**Working buttons:**
- BitcoinWriter - `/images/clientprojects/bitcoin-writer/bitcoin-writer-button.png` (image-based)
- MoneyButton - Custom CSS design (good reference)
- BitcoinSpreadsheets - `/images/clientprojects/bitcoin-spreadsheet/bitcoin-spreadsheet.png` (image-based)
- NinjaPunkGirls - Custom gradient design (good reference)

**Issues:**
- Image-based buttons look inconsistent/poor quality
- No unified visual language across buttons
- Missing buttons for new projects

## Projects Needing Button Redesign

- [ ] Bitcoin Writer - Current image looks dated
- [ ] Bitcoin Spreadsheets - Unclear visual connection to product
- [ ] Ninja Punk Girls - Could be more polished
- [ ] MoneyButton Store - Keep current design (already good)
- [ ] Any future project buttons

## Redesign Options

### Option 1: Custom CSS Designs (Recommended)
**Pros:**
- No image dependency
- Responsive at any size
- Easy to customize per project
- Fast load time
- Scalable for new projects

**Cons:**
- Requires design work in CSS/SVG
- More complex than image references

**Reference:** `MoneyButtonFloat.tsx` uses glossy dome effect with CSS gradients

### Option 2: Commission Professional Graphics
**Pros:**
- High quality
- Professional appearance
- Can be complex/detailed

**Cons:**
- Requires external designer
- Higher cost
- Longer timeline

### Option 3: Use Button-Graphic-Creator as Baseline
**Pros:**
- Fast to generate
- Consistent tool-based quality
- Customizable per project

**Cons:**
- May lack sophistication
- Tool limitations on complex designs

**Tool:** `/tools/button-graphic-creator`

## Design Requirements

Each button should:
- [ ] Be 80-90px at minimum
- [ ] Include project brand colors
- [ ] Have glow/shadow effect matching brand
- [ ] Be recognizable at small sizes (mobile)
- [ ] Work in both light/dark modes
- [ ] Have hover animation (scale/glow enhancement)
- [ ] Include text label or iconic element identifying project

## Implementation Checklist

When starting button redesign:

1. **Choose redesign approach** (CSS, graphics, tool)
2. **Define visual guidelines** for all buttons
3. **Design buttons** for each project:
   - Bitcoin Writer
   - Bitcoin Spreadsheets
   - Ninja Punk Girls
   - (others as needed)
4. **Update assets:**
   - Update `/images/clientprojects/{slug}/button.png` files
   - OR update CSS in `components/blog/{ProjectName}Float.tsx`
5. **Test components:**
   - Verify buttons render at correct size
   - Test hover/tap animations
   - Test glow effects
   - Verify portal rendering (no clipping)
6. **Test modals:**
   - Verify modal opens on click
   - Test investment tiers
   - Test redirect to product pages
7. **Update docs:**
   - Add design notes to `FLOATING_BUTTONS_GUIDE.md`
   - Document button color codes and styling

## Related Files

**Float components:**
- `components/blog/BitcoinWriterFloat.tsx`
- `components/blog/BitcoinSpreadsheetsFloat.tsx`
- `components/blog/NinjaPunkGirlsFloat.tsx`
- `components/blog/MoneyButtonFloat.tsx` (good reference)

**Button components:**
- `components/BitcoinWriterButton.tsx` (update as needed)

**Image locations:**
- `/images/clientprojects/bitcoin-writer/`
- `/images/clientprojects/bitcoin-spreadsheet/`
- `/images/clientprojects/ninjapunkgirls/`

**Documentation:**
- `docs/FLOATING_BUTTONS_GUIDE.md` - Complete floating button system
- `docs/BRAND_SYSTEM_SPEC.md` - Brand color/style guidelines

## Effort Estimate

- **Option 1 (CSS):** 2-4 hours per button
- **Option 2 (Professional):** Depends on designer
- **Option 3 (Tool):** 30 minutes per button

## Notes

- MoneyButtonFloat already has excellent CSS-based design - can be reference for approach
- Custom CSS allows for animation variations per button (pulsing, floating, etc.)
- Consider creating reusable CSS button patterns library once designs complete

---

**Blocked By:** None (can start anytime)
**Blocks:** None (non-critical path)
**Last Updated:** 2026-01-28
