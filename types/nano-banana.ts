// Nano Banana Video Control Panel - Type Definitions

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail_url: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
  created_at: string;
}

export interface TimelineClip {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  prompt: string;
  duration: number;
  effects: ClipEffects;
}

export interface ClipEffects {
  bananaFilter: boolean;
  glitch: boolean;
  glitchIntensity: number;
  speed: number;
  saturation: number;
  contrast: number;
}

export interface GlobalEffects extends ClipEffects {
  // Global effects applied to entire composition
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // % from left (0-100)
  y: number; // % from top (0-100)
  fontSize: number; // px
  color: string; // hex color
  fontWeight: 'normal' | 'bold';
  startTime: number; // seconds in composition
  duration: number; // seconds to show
}

export interface MusicSettings {
  trackId: number | null;
  trackUrl: string | null;
  trackName: string | null;
  startTime: number; // offset where music starts
  volume: number; // 0-1
}

export interface ExportSettings {
  quality: 'fast' | 'standard' | 'high';
  resolution: '720p' | '1080p';
  format: 'mp4';
}

export interface ExportPayload {
  clips: TimelineClip[];
  globalEffects: GlobalEffects;
  music: MusicSettings;
  textOverlays: TextOverlay[];
  exportSettings: ExportSettings;
}

export interface NanoBananaState {
  // Video Generation
  generatedVideos: GeneratedVideo[];
  isGenerating: boolean;
  generationError: string | null;

  // Timeline
  timeline: TimelineClip[];
  selectedClipId: string | null;

  // Effects
  globalEffects: GlobalEffects;
  applyEffectsToAll: boolean;

  // Music
  music: MusicSettings;

  // Text Overlays
  textOverlays: TextOverlay[];

  // Export
  exportSettings: ExportSettings;
  isExporting: boolean;
  exportProgress: number;
  exportDownloadUrl: string | null;

  // UI
  activeTab: 'generate' | 'library' | 'timeline' | 'effects' | 'music' | 'text' | 'export';
}

export interface VideoGenerationParams {
  prompt: string;
  duration: 3 | 6;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  mode: 'normal' | 'fun' | 'custom' | 'spicy';
}
