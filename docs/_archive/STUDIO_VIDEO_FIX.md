# Studio Video Loading & Effects Fix

**Date:** 2026-01-15
**Issue:** Videos not loading in b0ase.com/studio live deployment
**Reference:** AI-VJ web-app.html at `/Volumes/2026/Projects/AI-VJ/public/web-app.html`

---

## 🔍 ROOT CAUSE ANALYSIS

### Current Implementation Issues

#### 1. **Video Loading Problem**

**Issue:** Videos are available in `/public/videos/` but may not be loading correctly in production.

**Current State:**
- Videos exist: ✅ (18 video files in `/public/videos/`)
- Fallback data configured: ✅
- Problem: Filenames with spaces and special characters

**Problematic Filenames:**
```
Professional_Mode_Generated_Video (2).mp4  ← Space and parentheses
```

**Current URL Generation (studio-context.tsx:198):**
```typescript
// Encode filename to handle spaces/special chars
url = `/videos/${encodeURIComponent(filename)}`;
```

This creates URLs like:
```
/videos/Professional_Mode_Generated_Video%20(2).mp4
```

Which should work, but might not if the file isn't being served correctly by Next.js static file serving.

#### 2. **Effects System Mismatch**

**AI-VJ (Working):**
- Canvas-based rendering with `ctx.drawImage()`
- 60fps render loop
- Pixel-level effects via `ctx.getImageData()`
- Real-time video frame manipulation
- Super effects: Ultra Glitch, Time Warp, Reality Break, Dimension Shift, Kaleidoscope
- All effects apply canvas transforms and pixel manipulation

**b0ase.com/studio (Current):**
- Single `<video>` element with CSS filters
- No canvas rendering
- Super Effects UI exists but **doesn't do anything**
- Basic CSS filters only: `brightness()`, `contrast()`, `saturate()`, `blur()`, `sepia()`, etc.
- Random Seek effect works (manipulates video.currentTime)

**The Problem:**
Super Effects components (`super-effects.tsx`) set state variables but have no rendering logic. They need canvas-based implementation to work.

---

## 🎯 SOLUTION STRATEGIES

### Strategy A: Quick Fix (2-4 hours)

**Goal:** Get videos loading and basic effects working

**Steps:**

1. **Fix Video Loading**
   - Rename problematic video files (remove spaces/special chars)
   - Or fix URL handling in production
   - Add better error logging

2. **Remove Non-Functional Super Effects**
   - Hide Super Effects panel temporarily
   - Focus on working CSS-filter effects
   - Document that canvas effects need separate implementation

3. **Improve Error Messages**
   - Add video loading error UI
   - Show which project/videos failed to load
   - Add retry mechanism

**Implementation:**

```typescript
// studio-context.tsx - Better error handling
video.onerror = (e) => {
  console.error(`Failed to load video:`, {
    file: filepath,
    error: e,
    videoError: video.error
  });

  // Try alternative URL format
  const filename = filepath.split('/').pop();
  const alternativeUrl = `/videos/${filename}`;
  if (alternativeUrl !== video.src) {
    console.log('Trying alternative URL:', alternativeUrl);
    video.src = alternativeUrl;
  }
};
```

### Strategy B: Full Canvas Implementation (1-2 weeks)

**Goal:** Match AI-VJ functionality with canvas-based rendering and all effects working

**Architecture:**

```
┌─────────────────────────────────────┐
│         Studio Page                 │
│  (app/studio/page.tsx)             │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│      StudioContext                  │
│  (components/studio/                │
│   studio-context.tsx)               │
│                                     │
│  • Video loading & state            │
│  • Effects state                    │
│  • Project management               │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────┐    ┌──────────────┐
│ Preview │    │ CanvasRenderer│
│  (JSX)  │    │   (New)      │
└─────────┘    └──────────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    ┌───────┐  ┌─────────┐  ┌────────┐
    │Hidden │  │ Canvas  │  │Effects │
    │Videos │  │ Render  │  │Renderer│
    │(3x)   │  │  Loop   │  │        │
    └───────┘  └─────────┘  └────────┘
```

**Components to Create:**

1. **CanvasRenderer Component** (`components/studio/canvas-renderer.tsx`)
   - Manages canvas and render loop
   - Draws video frames at 60fps
   - Applies all effects to canvas
   - Handles multiple hidden video elements

2. **EffectEngine** (`lib/studio/effect-engine.ts`)
   - Pure functions for each effect
   - Ultra Glitch: Pixel corruption
   - Time Warp: Playback speed modulation
   - Reality Break: Canvas distortion
   - Dimension Shift: Multi-layer blending
   - Kaleidoscope: Radial mirroring
   - Fractal Mode: Recursive rendering

3. **VideoManager** (`lib/studio/video-manager.ts`)
   - Handles multiple video element lifecycle
   - Pre-buffering next videos
   - Smooth transitions between clips

**Key Implementation Details:**

```typescript
// canvas-renderer.tsx pseudo-code
export function CanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const { clips, activeClipId, effects, superEffects } = useStudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function renderLoop() {
      const activeVideo = videoRefs.current[currentIndex];

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw video
      if (activeVideo && activeVideo.readyState >= 2) {
        ctx.drawImage(activeVideo, 0, 0, canvas.width, canvas.height);
      }

      // Apply CSS-filter equivalents
      applyBasicFilters(ctx, canvas, effects);

      // Apply super effects
      if (superEffects.ultraGlitch.enabled) {
        applyUltraGlitch(ctx, canvas, superEffects.ultraGlitch.intensity);
      }
      if (superEffects.kaleidoscope.enabled) {
        applyKaleidoscope(ctx, canvas, superEffects.kaleidoscope.segments);
      }

      requestAnimationFrame(renderLoop);
    }

    renderLoop();
  }, [clips, effects, superEffects]);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full" />
      {clips.map((clip, i) => (
        <video
          key={clip.id}
          ref={el => videoRefs.current[i] = el}
          src={clip.url}
          style={{ display: 'none' }}
          muted
          playsInline
        />
      ))}
    </>
  );
}
```

```typescript
// effect-engine.ts
export function applyUltraGlitch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number
) {
  const glitchChance = intensity / 100;
  if (Math.random() < glitchChance * 0.5) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Random channel corruption
    const corruptionChance = intensity / 500;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < corruptionChance) {
        data[i] = Math.random() * 255;     // Red
        data[i + 1] = Math.random() * 255; // Green
        data[i + 2] = Math.random() * 255; // Blue
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

export function applyKaleidoscope(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  segments: number
) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');

  // Copy current canvas
  tempCtx.drawImage(canvas, 0, 0);

  // Clear main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw radial segments
  const angleStep = (Math.PI * 2) / segments;
  for (let i = 0; i < segments; i++) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(i * angleStep);
    if (i % 2 === 1) {
      ctx.scale(-1, 1); // Mirror alternate segments
    }
    ctx.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
  }
}

export function applyRealityBreak(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number
) {
  // Wave distortion effect
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const newImageData = ctx.createImageData(canvas.width, canvas.height);
  const newData = newImageData.data;

  const waveStrength = intensity / 2;
  const waveFrequency = 0.05;

  for (let y = 0; y < canvas.height; y++) {
    const offsetX = Math.sin(y * waveFrequency) * waveStrength;

    for (let x = 0; x < canvas.width; x++) {
      const sourceX = Math.floor(x + offsetX);
      const clampedX = Math.max(0, Math.min(canvas.width - 1, sourceX));

      const sourceIndex = (y * canvas.width + clampedX) * 4;
      const destIndex = (y * canvas.width + x) * 4;

      newData[destIndex] = data[sourceIndex];         // R
      newData[destIndex + 1] = data[sourceIndex + 1]; // G
      newData[destIndex + 2] = data[sourceIndex + 2]; // B
      newData[destIndex + 3] = data[sourceIndex + 3]; // A
    }
  }

  ctx.putImageData(newImageData, 0, 0);
}
```

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Quick Fix (Immediate)

**Files to Modify:**

1. **Rename video files** (remove spaces)
   ```bash
   cd /Volumes/2026/Projects/b0ase.com/public/videos/
   mv "Professional_Mode_Generated_Video (2).mp4" "Professional_Mode_Generated_Video_2.mp4"
   ```

2. **Update fallback data** (`studio-context.tsx:122-140`)
   ```typescript
   cherry: [
     { id: 'c1', filename: 'Extended_Video.mp4', url: '/videos/Extended_Video.mp4' },
     { id: 'c2', filename: 'Professional_Mode_2.mp4', url: '/videos/Professional_Mode_Generated_Video_2.mp4' },
   ],
   ```

3. **Add video error logging** (`components/studio/preview.tsx`)
   ```typescript
   <video
     ref={videoRef}
     src={activeClip.url}
     onError={(e) => {
       console.error('Video load error:', {
         src: activeClip.url,
         error: e.currentTarget.error
       });
     }}
     onLoadedMetadata={() => {
       console.log('Video loaded successfully:', activeClip.url);
     }}
   />
   ```

4. **Hide Super Effects temporarily** (`app/studio/page.tsx:115`)
   ```typescript
   {/* Temporarily hidden - needs canvas implementation */}
   {false && (
     <div className="flex-1 min-w-[200px] overflow-y-auto no-scrollbar scroll-smooth">
       <ErrorBoundary><SuperEffects /></ErrorBoundary>
     </div>
   )}
   ```

### Phase 2: Canvas Implementation (1-2 weeks)

**Week 1: Core Canvas Renderer**

1. Create `components/studio/canvas-renderer.tsx`
2. Create `lib/studio/effect-engine.ts` with basic filters
3. Replace `<video>` in Preview with canvas
4. Test video rendering and basic CSS filters on canvas

**Week 2: Super Effects**

5. Implement Ultra Glitch effect
6. Implement Kaleidoscope effect
7. Implement Reality Break effect
8. Implement Time Warp effect
9. Implement Dimension Shift effect
10. Re-enable Super Effects panel

---

## 🧪 TESTING CHECKLIST

### Video Loading Tests

- [ ] Videos load in development (npm run dev)
- [ ] Videos load in production build (npm run build && npm start)
- [ ] Videos load in deployed environment
- [ ] All project tabs load different videos
- [ ] Video switching works smoothly
- [ ] Console shows no 404 errors for videos

### Effects Tests

**Basic CSS Filters:**
- [ ] Brightness slider works
- [ ] Contrast slider works
- [ ] Saturation slider works
- [ ] Blur slider works
- [ ] Filter presets (sepia, noir, vibrant, etc.) work
- [ ] Random Seek effect works

**Canvas Effects (Phase 2):**
- [ ] Ultra Glitch renders correctly
- [ ] Kaleidoscope mirrors properly
- [ ] Reality Break distorts video
- [ ] Time Warp modulates playback
- [ ] Dimension Shift blends layers
- [ ] Effects can be combined
- [ ] Performance stays above 30fps

### UI Tests

- [ ] Project tabs switch correctly
- [ ] Effects panel expands/collapses
- [ ] Sliders update values in real-time
- [ ] Color theme changes apply correctly
- [ ] Mobile responsiveness works
- [ ] Error messages display when videos fail

---

## 🔧 DEBUGGING COMMANDS

```bash
# Check video files exist
ls -lh /Volumes/2026/Projects/b0ase.com/public/videos/

# Test video loading in dev
npm run dev
# Open http://localhost:3000/studio
# Check browser console for errors

# Build and test production
npm run build
npm start
# Check if videos load in production build

# Check for 404s in Network tab
# Browser DevTools → Network → Filter: "videos"
```

---

## 📚 REFERENCE: AI-VJ Implementation

**Key Files:**
- `/Volumes/2026/Projects/AI-VJ/public/web-app.html` (6251 lines)

**Successful Patterns from AI-VJ:**

1. **Multiple Hidden Videos:**
   ```html
   <video id="video1" style="display: none;" muted></video>
   <video id="video2" style="display: none;" muted></video>
   <video id="video3" style="display: none;" muted></video>
   ```

2. **Canvas Render Loop:**
   ```javascript
   function render() {
     const video = videos[currentVideoIndex];
     ctx.fillRect(0, 0, canvas.width, canvas.height);
     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
     applyFilters(ctx, canvas.width, canvas.height);
     requestAnimationFrame(render);
   }
   ```

3. **Effect Application Order:**
   ```javascript
   // 1. Draw video
   ctx.drawImage(video, 0, 0, width, height);

   // 2. Apply CSS-filter equivalents
   applyFilter(ctx, width, height);

   // 3. Apply glitch effects
   if (glitchEnabled) applyGlitchEffect(ctx, width, height);

   // 4. Apply super effects
   if (ultraGlitchEnabled) applyUltraGlitch(ctx, width, height);
   if (kaleidoscopeEnabled) applyKaleidoscope(ctx, width, height);
   ```

4. **Video Buffering Strategy:**
   ```javascript
   // Always buffer next video
   const bufferVideoIndex = (currentVideoIndex + 1) % videos.length;
   const nextVideoFileIndex = (currentVideoFileIndex + 1) % videoFiles.length;
   loadVideo(bufferVideoIndex, videoFiles[nextVideoFileIndex]);
   ```

---

## 🎨 UI POLISH (Post-Implementation)

### Improvements to Match AI-VJ Polish

1. **Timeline Enhancements:**
   - Visual playhead indicator
   - Thumbnail previews for clips
   - Drag-to-seek functionality
   - Waveform visualization for audio

2. **Effects UI:**
   - Effect preset buttons
   - Save/load effect configurations
   - Effect intensity animations
   - Visual feedback when effects apply

3. **Performance:**
   - FPS counter display
   - Performance mode toggle (lower quality for better FPS)
   - GPU acceleration detection
   - Canvas size optimization

4. **Export:**
   - Record canvas output
   - Export as video file
   - Capture screenshots
   - Share presets

---

## ✅ SUCCESS CRITERIA

**Phase 1 (Quick Fix):**
- ✅ Videos load without errors in production
- ✅ All 5 projects (cherry, vexvoid, aivj, npg, zerodice) show videos
- ✅ Basic CSS filters work (brightness, contrast, etc.)
- ✅ Random Seek effect works
- ✅ Console errors cleared

**Phase 2 (Full Canvas):**
- ✅ Canvas renders at 60fps
- ✅ All Super Effects function correctly
- ✅ Effects can be combined without performance issues
- ✅ UI matches AI-VJ polish level
- ✅ No memory leaks during extended sessions
- ✅ Works on mobile and desktop

---

## 📞 NEXT STEPS

1. **Choose Strategy:**
   - Strategy A (Quick Fix) for immediate deployment
   - Strategy B (Full Canvas) for feature-complete implementation

2. **Execute Phase 1:**
   - Rename videos with spaces
   - Add error logging
   - Test in production

3. **Plan Phase 2:**
   - Create detailed canvas renderer spec
   - Break down into smaller tasks
   - Set up performance benchmarks

4. **Document Results:**
   - Update this document with findings
   - Create video loading guide
   - Document effect implementation patterns

---

**Status:** Ready for implementation
**Recommended:** Start with Strategy A (Quick Fix), then upgrade to Strategy B
**Timeline:** Phase 1 (1 day), Phase 2 (1-2 weeks)
