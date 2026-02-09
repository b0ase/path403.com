// src/index.ts
var DEFAULT_PREFERENCES = {
  soundEnabled: true,
  soundVolume: 0.5,
  visualEnabled: true,
  hapticEnabled: true,
  reducedMotion: false
};
var DEFAULT_PARTICLE_CONFIG = {
  count: 50,
  spread: 360,
  velocity: 25,
  gravity: 0.5,
  decay: 0.95,
  colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
  shapes: ["circle", "square"]
};
var EFFECT_PRESETS = {
  payment_sent: {
    sound: "whoosh",
    visual: "ripple",
    haptic: "light"
  },
  payment_received: {
    sound: ["coin", "ding"],
    visual: ["confetti", "sparkle"],
    haptic: "success",
    colors: ["#FFD700", "#FFA500"]
  },
  token_purchase: {
    sound: "cash",
    visual: "particles",
    haptic: "medium"
  },
  token_sale: {
    sound: "success",
    visual: "glow",
    haptic: "success"
  },
  milestone: {
    sound: "reward",
    visual: "fireworks",
    haptic: "heavy"
  },
  achievement: {
    sound: ["unlock", "chime"],
    visual: ["explosion", "sparkle"],
    haptic: "success"
  },
  level_up: {
    sound: "levelup",
    visual: ["confetti", "glow"],
    haptic: "heavy",
    intensity: 1.5
  },
  streak: {
    sound: "reward",
    visual: "pulse",
    haptic: "medium"
  },
  first_time: {
    sound: "unlock",
    visual: "sparkle",
    haptic: "success"
  },
  custom: {
    sound: "click",
    haptic: "light"
  }
};
var DopamineManager = class {
  constructor(preferences) {
    this.triggers = /* @__PURE__ */ new Map();
    this.triggerCounts = /* @__PURE__ */ new Map();
    this.lastTriggerTime = /* @__PURE__ */ new Map();
    this.audioCache = /* @__PURE__ */ new Map();
    this.soundUrls = /* @__PURE__ */ new Map();
    this.preferences = { ...DEFAULT_PREFERENCES, ...preferences };
  }
  // ==========================================================================
  // Configuration
  // ==========================================================================
  setPreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
  }
  getPreferences() {
    return { ...this.preferences };
  }
  setSoundUrl(effect, url) {
    this.soundUrls.set(effect, url);
  }
  setSoundUrls(urls) {
    for (const [effect, url] of Object.entries(urls)) {
      this.soundUrls.set(effect, url);
    }
  }
  setVisualHandler(handler) {
    this.visualHandler = handler;
  }
  setHapticHandler(handler) {
    this.hapticHandler = handler;
  }
  // ==========================================================================
  // Trigger Management
  // ==========================================================================
  registerTrigger(id, config) {
    this.triggers.set(id, config);
    this.triggerCounts.set(id, 0);
  }
  unregisterTrigger(id) {
    this.triggers.delete(id);
    this.triggerCounts.delete(id);
    this.lastTriggerTime.delete(id);
  }
  async trigger(typeOrId, overrides) {
    const registered = this.triggers.get(typeOrId);
    if (registered) {
      await this.executeTrigger(typeOrId, registered, overrides);
      return;
    }
    const preset = EFFECT_PRESETS[typeOrId];
    if (preset) {
      const config = {
        type: typeOrId,
        effects: { ...preset, ...overrides }
      };
      await this.executeEffects(config.effects);
    }
  }
  async executeTrigger(id, config, overrides) {
    if (config.condition && !config.condition()) {
      return;
    }
    const lastTime = this.lastTriggerTime.get(id) || 0;
    if (config.cooldown && Date.now() - lastTime < config.cooldown) {
      return;
    }
    const count = this.triggerCounts.get(id) || 0;
    if (config.maxPerSession && count >= config.maxPerSession) {
      return;
    }
    this.lastTriggerTime.set(id, Date.now());
    this.triggerCounts.set(id, count + 1);
    const effects = { ...config.effects, ...overrides };
    await this.executeEffects(effects);
  }
  async executeEffects(config) {
    const promises = [];
    if (this.preferences.soundEnabled && config.sound) {
      const sounds = Array.isArray(config.sound) ? config.sound : [config.sound];
      for (const sound of sounds) {
        promises.push(this.playSound(sound));
      }
    }
    if (this.preferences.visualEnabled && !this.preferences.reducedMotion && config.visual) {
      const visuals = Array.isArray(config.visual) ? config.visual : [config.visual];
      for (const visual of visuals) {
        this.showVisual(visual, config);
      }
    }
    if (this.preferences.hapticEnabled && config.haptic) {
      this.triggerHaptic(config.haptic);
    }
    await Promise.all(promises);
  }
  // ==========================================================================
  // Individual Effects
  // ==========================================================================
  async playSound(effect) {
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
      console.debug(`Failed to play sound: ${effect}`);
    }
  }
  showVisual(effect, config) {
    if (this.visualHandler) {
      this.visualHandler(effect, config);
    }
  }
  triggerHaptic(type) {
    if (this.hapticHandler) {
      this.hapticHandler(type);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [10, 50, 10],
        warning: [50, 50, 50],
        error: [100, 50, 100],
        selection: 5
      };
      navigator.vibrate(patterns[type]);
    }
  }
  // ==========================================================================
  // Presets
  // ==========================================================================
  async celebratePayment(amount) {
    const intensity = Math.min(amount / 100, 2);
    await this.trigger("payment_received", { intensity });
  }
  async celebrateMilestone(name) {
    await this.trigger("milestone");
  }
  async celebrateAchievement(name) {
    await this.trigger("achievement");
  }
  async celebrateLevelUp(level) {
    await this.trigger("level_up", { intensity: Math.min(level / 10, 2) });
  }
  async notifySuccess() {
    await this.executeEffects({
      sound: "success",
      haptic: "success"
    });
  }
  async notifyError() {
    await this.executeEffects({
      sound: "error",
      visual: "shake",
      haptic: "error"
    });
  }
  // ==========================================================================
  // Session Management
  // ==========================================================================
  resetSession() {
    this.triggerCounts.clear();
    this.lastTriggerTime.clear();
  }
  preloadSounds() {
    for (const [, url] of this.soundUrls) {
      if (!this.audioCache.has(url)) {
        const audio = new Audio(url);
        audio.preload = "auto";
        this.audioCache.set(url, audio);
      }
    }
  }
  clearCache() {
    this.audioCache.clear();
  }
};
function createDopamineManager(preferences) {
  return new DopamineManager(preferences);
}
function getDefaultSoundUrls() {
  const baseUrl = "https://assets.b0ase.com/sounds";
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
    cash: `${baseUrl}/cash.mp3`
  };
}
function createConfettiConfig(colors, count) {
  return {
    ...DEFAULT_PARTICLE_CONFIG,
    colors: colors || DEFAULT_PARTICLE_CONFIG.colors,
    count: count || DEFAULT_PARTICLE_CONFIG.count
  };
}
function scaleIntensity(base, amount, maxAmount) {
  return base * Math.min(amount / maxAmount, 2);
}
function shouldTriggerForAmount(amount, threshold = 10) {
  return amount >= threshold;
}
function getRandomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}
function generateParticles(config) {
  const particles = [];
  for (let i = 0; i < config.count; i++) {
    const angle = Math.random() * config.spread * Math.PI / 180;
    const velocity = config.velocity * (0.5 + Math.random() * 0.5);
    particles.push({
      x: 0.5,
      y: 0.5,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 10,
      color: getRandomColor(config.colors),
      shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
      size: 5 + Math.random() * 10
    });
  }
  return particles;
}
export {
  DEFAULT_PARTICLE_CONFIG,
  DEFAULT_PREFERENCES,
  DopamineManager,
  EFFECT_PRESETS,
  createConfettiConfig,
  createDopamineManager,
  generateParticles,
  getDefaultSoundUrls,
  getRandomColor,
  scaleIntensity,
  shouldTriggerForAmount
};
//# sourceMappingURL=index.js.map