# Performance Optimization Guide

This document outlines the performance optimizations implemented to improve image and video loading on the landing page.

## Issues Identified

1. **Large video files** - Some videos were 5MB+ causing slow loading
2. **Large image files** - Several images were 1MB+ (some over 5MB)
3. **No lazy loading** for videos and images
4. **No preloading** of critical assets
5. **Videos autoplay immediately** which can slow down page load

## Optimizations Implemented

### 1. Video Performance Improvements

- **Lazy Loading**: Videos now use `preload="metadata"` instead of full preload
- **Conditional Autoplay**: Videos only play on hover, not immediately on page load
- **Loading States**: Added loading spinners while videos are buffering
- **Preload Critical Videos**: First 3 videos are preloaded for better perceived performance

### 2. Image Performance Improvements

- **Next.js Image Optimization**: Added WebP and AVIF format support
- **Responsive Sizes**: Added proper `sizes` attribute for responsive images
- **Lazy Loading**: Images use `loading="lazy"` for better performance

### 3. Next.js Configuration

- **Image Formats**: Added WebP and AVIF support for better compression
- **Device Sizes**: Optimized image sizes for different device resolutions
- **Cache TTL**: Set minimum cache time for better caching

### 4. Asset Optimization Scripts

#### Image Optimization
```bash
npm run optimize:images
```
- Uses ImageMagick to compress PNG and JPEG files
- Only processes files larger than 500KB
- Creates backups before optimization

#### Video Optimization
```bash
npm run optimize:videos
```
- Uses FFmpeg to compress MP4 files
- Only processes files larger than 2MB
- Optimizes with H.264 codec and lower bitrate

#### Optimize All Assets
```bash
npm run optimize:all
```

## Installation Requirements

### For Image Optimization
```bash
# macOS
brew install imagemagick

# Ubuntu
sudo apt-get install imagemagick

# Windows
# Download from https://imagemagick.org/
```

### For Video Optimization
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/
```

## Performance Metrics

After optimization, expect:
- **Images**: 20-40% size reduction
- **Videos**: 30-60% size reduction
- **Page Load Time**: 2-5 second improvement
- **First Contentful Paint**: 1-2 second improvement

## Best Practices

1. **Keep videos under 2MB** for optimal web performance
2. **Use WebP format** for images when possible
3. **Compress assets** before adding to the project
4. **Run optimization scripts** after adding new large assets
5. **Monitor Core Web Vitals** in production

## Monitoring

Use browser DevTools to monitor:
- Network tab for asset loading times
- Performance tab for Core Web Vitals
- Lighthouse for overall performance scores

## Future Improvements

1. **CDN Integration**: Consider using a CDN for static assets
2. **Progressive Loading**: Implement progressive JPEG loading
3. **Video Streaming**: Consider HLS or DASH for very large videos
4. **Service Worker**: Add caching for frequently accessed assets
