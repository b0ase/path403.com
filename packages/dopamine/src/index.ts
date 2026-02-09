/**
 * @b0ase/dopamine
 *
 * Audio manager and visual effects for payment gamification.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Sound effect type */
export type SoundEffect =
  | 'success'
  | 'error'
  | 'click'
  | 'coin'
  | 'reward'
  | 'levelup'
  | 'unlock'
  | 'notification'
  | 'whoosh'
  | 'ding'
  | 'chime'
  | 'cash';

/** Visual effect type */
export type VisualEffect =
  | 'confetti'
  | 'particles'
  | 'sparkle'
  | 'glow'
  | 'pulse'
  | 'bounce'
  | 'shake'
  | 'ripple'
  | 'explosion'
  | 'fireworks';

/** Haptic feedback type */
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/** Trigger type */
export type TriggerType =
  | 'payment_sent'
  | 'payment_received'
  | 'token_purchase'
  | 'token_sale'
  | 'milestone'
  | 'achievement'
  | 'level_up'
  | 'streak'
  | 'first_time'
  | 'custom';

/** Effect config */
export interface EffectConfig {
  sound?: SoundEffect | SoundEffect[];
  visual?: VisualEffect | VisualEffect[];
  haptic?: HapticType;
  duration?: number;
  intensity?: number;
  color?: string;
  colors?: string[];
}

/** Trigger config */
export interface TriggerConfig {
  type: TriggerType;
  effects: EffectConfig;
  condition?: () => boolean;
  cooldown?: number;
  maxPerSession?: number;
}

/** Sound config */
export interface SoundConfig {
  url: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

/** Particle config */
export interface ParticleConfig {
  count: number;
  spread: number;
  velocity: number;
  gravity: number;
  decay: number;
  colors: string[];
  shapes: ('circle' | 'square' | 'star')[];
}

/** Animation config */
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  delay?: number;
  iterations?: number;
}

/** Feedback preferences */
export interface FeedbackPreferences {
  soundEnabled: boolean;
  soundVolume: number;
  visualEnabled: boolean;
  hapticEnabled: boolean;
  reducedMotion: boolean;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_PREFERENCES: FeedbackPreferences = {
  soundEnabled: true,
  soundVolume: 0.5,
  visualEnabled: true,
  hapticEnabled: true,
  reducedMotion: false,
};

export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  count: 50,
  spread: 360,
  velocity: 25,
  gravity: 0.5,
  decay: 0.95,
  colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  shapes: ['circle', 'square'],
};

export const EFFECT_PRESETS: Record<TriggerType, EffectConfig> = {
  payment_sent: {
    sound: 'whoosh',
    visual: 'ripple',
    haptic: 'light',
  },
  payment_received: {
    sound: ['coin', 'ding'],
    visual: ['confetti', 'sparkle'],
    haptic: 'success',
    colors: ['#FFD700', '#FFA500'],
  },
  token_purchase: {
    sound: 'cash',
    visual: 'particles',
    haptic: 'medium',
  },
  token_sale: {
    sound: 'success',
    visual: 'glow',
    haptic: 'success',
  },
  milestone: {
    sound: 'reward',
    visual: 'fireworks',
    haptic: 'heavy',
  },
  achievement: {
    sound: ['unlock', 'chime'],
    visual: ['explosion', 'sparkle'],
    haptic: 'success',
  },
  level_up: {
    sound: 'levelup',
    visual: ['confetti', 'glow'],
    haptic: 'heavy',
    intensity: 1.5,
  },
  streak: {
    sound: 'reward',
    visual: 'pulse',
    haptic: 'medium',
  },
  first_time: {
    sound: 'unlock',
    visual: 'sparkle',
    haptic: 'success',
  },
  custom: {
    sound: 'click',
    haptic: 'light',
  },
};

// ============================================================================
// Dopamine Manager
// ============================================================================

export class DopamineManager {
  private preferences: FeedbackPreferences;
  private triggers: Map<string, TriggerConfig> = new Map();
  private triggerCounts: Map<string, number> = new Map();
  private lastTriggerTime: Map<string, number> = new Map();
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private soundUrls: Map<SoundEffect, string> = new Map();
  private visualHandler?: (effect: VisualEffect, config: EffectConfig) => void;
  private hapticHandler?: (type: HapticType) => void;

  constructor(preferences?: Partial<FeedbackPreferences>) {
    this.preferences = { ...DEFAULT_PREFERENCES, ...preferences };
  }

  // ==========================================================================
  // Configuration
  // ==========================================================================

  setPreferences(preferences: Partial<FeedbackPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  getPreferences(): FeedbackPreferences {
    return { ...this.preferences };
  }

  setSoundUrl(effect: SoundEffect, url: string): void {
    this.soundUrls.set(effect, url);
  }

  setSoundUrls(urls: Partial<Record<SoundEffect, string>>): void {
    for (const [effect, url] of Object.entries(urls)) {
      this.soundUrls.set(effect as SoundEffect, url);
    }
  }

  setVisualHandler(handler: (effect: VisualEffect, config: EffectConfig) => void): void {
    this.visualHandler = handler;
  }

  setHapticHandler(handler: (type: HapticType) => void): void {
    this.hapticHandler = handler;
  }

  // ==========================================================================
  // Trigger Management
  // ==========================================================================

  registerTrigger(id: string, config: TriggerConfig): void {
    this.triggers.set(id, config);
    this.triggerCounts.set(id, 0);
  }

  unregisterTrigger(id: string): void {
    this.triggers.delete(id);
    this.triggerCounts.delete(id);
    this.lastTriggerTime.delete(id);
  }

  async trigger(typeOrId: TriggerType | string, overrides?: Partial<EffectConfig>): Promise<void> {
    // Check if it's a registered trigger ID
    const registered = this.triggers.get(typeOrId);
    if (registered) {
      await this.executeTrigger(typeOrId, registered, overrides);
      return;
    }

    // Otherwise treat as a trigger type with preset
    const preset = EFFECT_PRESETS[typeOrId as TriggerType];
    if (preset) {
      const config: TriggerConfig = {
        type: typeOrId as TriggerType,
        effects: { ...preset, ...overrides },
      };
      await this.executeEffects(config.effects);
    }
  }

  private async executeTrigger(
    id: string,
    config: TriggerConfig,
    overrides?: Partial<EffectConfig>
  ): Promise<void> {
    // Check condition
    if (config.condition && !config.condition()) {
      return;
    }

    // Check cooldown
    const lastTime = this.lastTriggerTime.get(id) || 0;
    if (config.cooldown && Date.now() - lastTime < config.cooldown) {
      return;
    }

    // Check max per session
    const count = this.triggerCounts.get(id) || 0;
    if (config.maxPerSession && count >= config.maxPerSession) {
      return;
    }

    // Update tracking
    this.lastTriggerTime.set(id, Date.now());
    this.triggerCounts.set(id, count + 1);

    // Execute effects
    const effects = { ...config.effects, ...overrides };
    await this.executeEffects(effects);
  }

  private async executeEffects(config: EffectConfig): Promise<void> {
    const promises: Promise<void>[] = [];

    // Sound effects
    if (this.preferences.soundEnabled && config.sound) {
      const sounds = Array.isArray(config.sound) ? config.sound : [config.sound];
      for (const sound of sounds) {
        promises.push(this.playSound(sound));
      }
    }

    // Visual effects
    if (this.preferences.visualEnabled && !this.preferences.reducedMotion && config.visual) {
      const visuals = Array.isArray(config.visual) ? config.visual : [config.visual];
      for (const visual of visuals) {
        this.showVisual(visual, config);
      }
    }

    // Haptic feedback
    if (this.preferences.hapticEnabled && config.haptic) {
      this.triggerHaptic(config.haptic);
    }

    await Promise.all(promises);
  }

  // ==========================================================================
  // Individual Effects
  // ==========================================================================

  async playSound(effect: SoundEffect): Promise<void> {
    const url = this.soundUrls.get(effect);
    if (!url) return;

    try {
      let audio = this.audioCache.get(url);
      if (!audio) {
        audio = new Audio(url);
        this.audioCache.set(url, audio);
      }

      audio.volume = this.preferences.soundVolume;
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      // Audio play failed (common on mobile without user interaction)
      console.debug(`Failed to play sound: ${effect}`);
    }
  }

  showVisual(effect: VisualEffect, config: EffectConfig): void {
    if (this.visualHandler) {
      this.visualHandler(effect, config);
    }
  }

  triggerHaptic(type: HapticType): void {
    if (this.hapticHandler) {
      this.hapticHandler(type);
      return;
    }

    // Try native vibration API
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [10, 50, 10],
        warning: [50, 50, 50],
        error: [100, 50, 100],
        selection: 5,
      };
      navigator.vibrate(patterns[type]);
    }
  }

  // ==========================================================================
  // Presets
  // ==========================================================================

  async celebratePayment(amount: number): Promise<void> {
    const intensity = Math.min(amount / 100, 2); // Scale based on amount
    await this.trigger('payment_received', { intensity });
  }

  async celebrateMilestone(name: string): Promise<void> {
    await this.trigger('milestone');
  }

  async celebrateAchievement(name: string): Promise<void> {
    await this.trigger('achievement');
  }

  async celebrateLevelUp(level: number): Promise<void> {
    await this.trigger('level_up', { intensity: Math.min(level / 10, 2) });
  }

  async notifySuccess(): Promise<void> {
    await this.executeEffects({
      sound: 'success',
      haptic: 'success',
    });
  }

  async notifyError(): Promise<void> {
    await this.executeEffects({
      sound: 'error',
      visual: 'shake',
      haptic: 'error',
    });
  }

  // ==========================================================================
  // Session Management
  // ==========================================================================

  resetSession(): void {
    this.triggerCounts.clear();
    this.lastTriggerTime.clear();
  }

  preloadSounds(): void {
    for (const [, url] of this.soundUrls) {
      if (!this.audioCache.has(url)) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.audioCache.set(url, audio);
      }
    }
  }

  clearCache(): void {
    this.audioCache.clear();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createDopamineManager(preferences?: Partial<FeedbackPreferences>): DopamineManager {
  return new DopamineManager(preferences);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getDefaultSoundUrls(): Record<SoundEffect, string> {
  // These would typically be replaced with actual asset URLs
  const baseUrl = 'https://assets.b0ase.com/sounds';
  return {
    success: `${baseUrl}/success.mp3`,
    error: `${baseUrl}/error.mp3`,
    click: `${baseUrl}/click.mp3`,
    coin: `${baseUrl}/coin.mp3`,
    reward: `${baseUrl}/reward.mp3`,
    levelup: `${baseUrl}/levelup.mp3`,
    unlock: `${baseUrl}/unlock.mp3`,
    notification: `${baseUrl}/notification.mp3`,
    whoosh: `${baseUrl}/whoosh.mp3`,
    ding: `${baseUrl}/ding.mp3`,
    chime: `${baseUrl}/chime.mp3`,
    cash: `${baseUrl}/cash.mp3`,
  };
}

export function createConfettiConfig(
  colors?: string[],
  count?: number
): ParticleConfig {
  return {
    ...DEFAULT_PARTICLE_CONFIG,
    colors: colors || DEFAULT_PARTICLE_CONFIG.colors,
    count: count || DEFAULT_PARTICLE_CONFIG.count,
  };
}

export function scaleIntensity(base: number, amount: number, maxAmount: number): number {
  return base * Math.min(amount / maxAmount, 2);
}

export function shouldTriggerForAmount(amount: number, threshold: number = 10): boolean {
  return amount >= threshold;
}

export function getRandomColor(colors: string[]): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateParticles(config: ParticleConfig): Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: string;
  size: number;
}> {
  const particles = [];
  for (let i = 0; i < config.count; i++) {
    const angle = (Math.random() * config.spread * Math.PI) / 180;
    const velocity = config.velocity * (0.5 + Math.random() * 0.5);

    particles.push({
      x: 0.5,
      y: 0.5,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 10,
      color: getRandomColor(config.colors),
      shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
      size: 5 + Math.random() * 10,
    });
  }
  return particles;
}
