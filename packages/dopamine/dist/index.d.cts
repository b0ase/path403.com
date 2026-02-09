/**
 * @b0ase/dopamine
 *
 * Audio manager and visual effects for payment gamification.
 *
 * @packageDocumentation
 */
/** Sound effect type */
type SoundEffect = 'success' | 'error' | 'click' | 'coin' | 'reward' | 'levelup' | 'unlock' | 'notification' | 'whoosh' | 'ding' | 'chime' | 'cash';
/** Visual effect type */
type VisualEffect = 'confetti' | 'particles' | 'sparkle' | 'glow' | 'pulse' | 'bounce' | 'shake' | 'ripple' | 'explosion' | 'fireworks';
/** Haptic feedback type */
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';
/** Trigger type */
type TriggerType = 'payment_sent' | 'payment_received' | 'token_purchase' | 'token_sale' | 'milestone' | 'achievement' | 'level_up' | 'streak' | 'first_time' | 'custom';
/** Effect config */
interface EffectConfig {
    sound?: SoundEffect | SoundEffect[];
    visual?: VisualEffect | VisualEffect[];
    haptic?: HapticType;
    duration?: number;
    intensity?: number;
    color?: string;
    colors?: string[];
}
/** Trigger config */
interface TriggerConfig {
    type: TriggerType;
    effects: EffectConfig;
    condition?: () => boolean;
    cooldown?: number;
    maxPerSession?: number;
}
/** Sound config */
interface SoundConfig {
    url: string;
    volume?: number;
    loop?: boolean;
    preload?: boolean;
}
/** Particle config */
interface ParticleConfig {
    count: number;
    spread: number;
    velocity: number;
    gravity: number;
    decay: number;
    colors: string[];
    shapes: ('circle' | 'square' | 'star')[];
}
/** Animation config */
interface AnimationConfig {
    duration: number;
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
    delay?: number;
    iterations?: number;
}
/** Feedback preferences */
interface FeedbackPreferences {
    soundEnabled: boolean;
    soundVolume: number;
    visualEnabled: boolean;
    hapticEnabled: boolean;
    reducedMotion: boolean;
}
declare const DEFAULT_PREFERENCES: FeedbackPreferences;
declare const DEFAULT_PARTICLE_CONFIG: ParticleConfig;
declare const EFFECT_PRESETS: Record<TriggerType, EffectConfig>;
declare class DopamineManager {
    private preferences;
    private triggers;
    private triggerCounts;
    private lastTriggerTime;
    private audioCache;
    private soundUrls;
    private visualHandler?;
    private hapticHandler?;
    constructor(preferences?: Partial<FeedbackPreferences>);
    setPreferences(preferences: Partial<FeedbackPreferences>): void;
    getPreferences(): FeedbackPreferences;
    setSoundUrl(effect: SoundEffect, url: string): void;
    setSoundUrls(urls: Partial<Record<SoundEffect, string>>): void;
    setVisualHandler(handler: (effect: VisualEffect, config: EffectConfig) => void): void;
    setHapticHandler(handler: (type: HapticType) => void): void;
    registerTrigger(id: string, config: TriggerConfig): void;
    unregisterTrigger(id: string): void;
    trigger(typeOrId: TriggerType | string, overrides?: Partial<EffectConfig>): Promise<void>;
    private executeTrigger;
    private executeEffects;
    playSound(effect: SoundEffect): Promise<void>;
    showVisual(effect: VisualEffect, config: EffectConfig): void;
    triggerHaptic(type: HapticType): void;
    celebratePayment(amount: number): Promise<void>;
    celebrateMilestone(name: string): Promise<void>;
    celebrateAchievement(name: string): Promise<void>;
    celebrateLevelUp(level: number): Promise<void>;
    notifySuccess(): Promise<void>;
    notifyError(): Promise<void>;
    resetSession(): void;
    preloadSounds(): void;
    clearCache(): void;
}
declare function createDopamineManager(preferences?: Partial<FeedbackPreferences>): DopamineManager;
declare function getDefaultSoundUrls(): Record<SoundEffect, string>;
declare function createConfettiConfig(colors?: string[], count?: number): ParticleConfig;
declare function scaleIntensity(base: number, amount: number, maxAmount: number): number;
declare function shouldTriggerForAmount(amount: number, threshold?: number): boolean;
declare function getRandomColor(colors: string[]): string;
declare function generateParticles(config: ParticleConfig): Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    shape: string;
    size: number;
}>;

export { type AnimationConfig, DEFAULT_PARTICLE_CONFIG, DEFAULT_PREFERENCES, DopamineManager, EFFECT_PRESETS, type EffectConfig, type FeedbackPreferences, type HapticType, type ParticleConfig, type SoundConfig, type SoundEffect, type TriggerConfig, type TriggerType, type VisualEffect, createConfettiConfig, createDopamineManager, generateParticles, getDefaultSoundUrls, getRandomColor, scaleIntensity, shouldTriggerForAmount };
