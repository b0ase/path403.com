"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CONTENT_TYPE_MIMES: () => CONTENT_TYPE_MIMES,
  DEFAULT_MINT_OPTIONS: () => DEFAULT_MINT_OPTIONS,
  DEFAULT_MODAL_CONFIG: () => DEFAULT_MODAL_CONFIG,
  DEFAULT_STEPS: () => DEFAULT_STEPS,
  MintingManager: () => MintingManager,
  calculateRoyalty: () => calculateRoyalty,
  createMintingManager: () => createMintingManager,
  formatFileSize: () => formatFileSize,
  generateMetadataJson: () => generateMetadataJson,
  getContentType: () => getContentType,
  getExplorerUrl: () => getExplorerUrl,
  getRarityColor: () => getRarityColor
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_MODAL_CONFIG = {
  allowedContentTypes: ["image", "video", "audio", "document"],
  maxFileSize: 100 * 1024 * 1024,
  // 100MB
  supportedStandards: ["ordinals", "bsv-21"],
  defaultStandard: "ordinals",
  defaultBlockchain: "bsv",
  showPreview: true,
  showAttributeEditor: true,
  showRoyaltySettings: true,
  showCollectionSelector: true
};
var DEFAULT_MINT_OPTIONS = {
  standard: "ordinals",
  blockchain: "bsv",
  quantity: 1,
  royaltyPercent: 5
};
var CONTENT_TYPE_MIMES = {
  image: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
  document: ["application/pdf", "text/plain", "text/markdown"],
  html: ["text/html"],
  "3d": ["model/gltf-binary", "model/gltf+json"],
  code: ["text/javascript", "application/json", "text/css"]
};
var DEFAULT_STEPS = [
  { id: "upload", title: "Upload", component: "upload", completed: false, active: true },
  { id: "metadata", title: "Details", component: "metadata", completed: false, active: false },
  { id: "options", title: "Options", component: "options", completed: false, active: false },
  { id: "preview", title: "Preview", component: "preview", completed: false, active: false },
  { id: "confirm", title: "Mint", component: "confirm", completed: false, active: false }
];
var MintingManager = class {
  constructor(config) {
    this.listeners = /* @__PURE__ */ new Set();
    this.config = { ...DEFAULT_MODAL_CONFIG, ...config };
    this.steps = DEFAULT_STEPS.map((s) => ({ ...s }));
    this.currentStepIndex = 0;
    this.state = {
      status: "idle",
      progress: 0,
      statusMessage: "",
      metadata: { name: "" },
      options: { ...DEFAULT_MINT_OPTIONS }
    };
  }
  // ==========================================================================
  // State Management
  // ==========================================================================
  getState() {
    return { ...this.state };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }
  // ==========================================================================
  // Step Management
  // ==========================================================================
  getSteps() {
    return this.steps.map((s) => ({ ...s }));
  }
  getCurrentStep() {
    return { ...this.steps[this.currentStepIndex] };
  }
  nextStep() {
    if (this.currentStepIndex >= this.steps.length - 1) return false;
    this.steps[this.currentStepIndex].completed = true;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex++;
    this.steps[this.currentStepIndex].active = true;
    return true;
  }
  prevStep() {
    if (this.currentStepIndex <= 0) return false;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex--;
    this.steps[this.currentStepIndex].active = true;
    this.steps[this.currentStepIndex].completed = false;
    return true;
  }
  goToStep(stepId) {
    const index = this.steps.findIndex((s) => s.id === stepId);
    if (index < 0) return false;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex = index;
    this.steps[this.currentStepIndex].active = true;
    return true;
  }
  // ==========================================================================
  // File Handling
  // ==========================================================================
  setFile(file) {
    this.updateState({ file });
    if (!this.state.metadata.name && file.name) {
      const name = file.name.replace(/\.[^/.]+$/, "");
      this.updateState({
        metadata: { ...this.state.metadata, name }
      });
    }
  }
  updateFileProgress(progress) {
    if (!this.state.file) return;
    this.updateState({
      file: { ...this.state.file, uploadProgress: progress }
    });
  }
  setFileUploaded(url) {
    if (!this.state.file) return;
    this.updateState({
      file: { ...this.state.file, uploadedUrl: url, uploadProgress: 100 },
      metadata: { ...this.state.metadata, image: url }
    });
  }
  // ==========================================================================
  // Metadata
  // ==========================================================================
  setMetadata(metadata) {
    this.updateState({
      metadata: { ...this.state.metadata, ...metadata }
    });
  }
  addAttribute(attribute) {
    const attributes = [...this.state.metadata.attributes || [], attribute];
    this.updateState({
      metadata: { ...this.state.metadata, attributes }
    });
  }
  updateAttribute(index, attribute) {
    const attributes = [...this.state.metadata.attributes || []];
    attributes[index] = attribute;
    this.updateState({
      metadata: { ...this.state.metadata, attributes }
    });
  }
  removeAttribute(index) {
    const attributes = [...this.state.metadata.attributes || []];
    attributes.splice(index, 1);
    this.updateState({
      metadata: { ...this.state.metadata, attributes }
    });
  }
  // ==========================================================================
  // Options
  // ==========================================================================
  setOptions(options) {
    this.updateState({
      options: { ...this.state.options, ...options }
    });
  }
  // ==========================================================================
  // Minting
  // ==========================================================================
  setMintCallback(callback) {
    this.mintCallback = callback;
  }
  async mint() {
    if (!this.mintCallback) {
      throw new Error("Mint callback not configured");
    }
    try {
      this.updateState({ status: "processing", progress: 0, statusMessage: "Preparing..." });
      this.updateState({ status: "uploading", progress: 20, statusMessage: "Uploading content..." });
      this.updateState({ status: "processing", progress: 40, statusMessage: "Processing metadata..." });
      this.updateState({ status: "signing", progress: 60, statusMessage: "Requesting signature..." });
      const result = await this.mintCallback(this.state);
      if (result.success) {
        this.updateState({
          status: "completed",
          progress: 100,
          statusMessage: "NFT minted successfully!",
          result
        });
      } else {
        this.updateState({
          status: "failed",
          progress: 0,
          statusMessage: result.error || "Minting failed",
          error: result.error,
          result
        });
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.updateState({
        status: "failed",
        progress: 0,
        statusMessage: errorMessage,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }
  // ==========================================================================
  // Validation
  // ==========================================================================
  validateFile(file) {
    if (file.size > this.config.maxFileSize) {
      return { valid: false, error: `File too large. Max size: ${formatFileSize(this.config.maxFileSize)}` };
    }
    const contentType = getContentType(file.type);
    if (!contentType || !this.config.allowedContentTypes.includes(contentType)) {
      return { valid: false, error: "File type not supported" };
    }
    return { valid: true };
  }
  validateMetadata() {
    const errors = [];
    if (!this.state.metadata.name?.trim()) {
      errors.push("Name is required");
    }
    if (this.state.metadata.name && this.state.metadata.name.length > 100) {
      errors.push("Name must be less than 100 characters");
    }
    return { valid: errors.length === 0, errors };
  }
  canProceed() {
    const step = this.getCurrentStep();
    switch (step.component) {
      case "upload":
        return !!this.state.file;
      case "metadata":
        return this.validateMetadata().valid;
      case "options":
        return true;
      case "preview":
        return true;
      case "confirm":
        return this.state.status !== "processing";
      default:
        return true;
    }
  }
  // ==========================================================================
  // Reset
  // ==========================================================================
  reset() {
    this.steps = DEFAULT_STEPS.map((s) => ({ ...s }));
    this.currentStepIndex = 0;
    this.state = {
      status: "idle",
      progress: 0,
      statusMessage: "",
      metadata: { name: "" },
      options: { ...DEFAULT_MINT_OPTIONS }
    };
    this.notify();
  }
};
function createMintingManager(config) {
  return new MintingManager(config);
}
function getContentType(mimeType) {
  for (const [type, mimes] of Object.entries(CONTENT_TYPE_MIMES)) {
    if (mimes.includes(mimeType)) {
      return type;
    }
  }
  return void 0;
}
function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}
function generateMetadataJson(metadata) {
  return JSON.stringify(metadata, null, 2);
}
function getRarityColor(rarity) {
  const colors = {
    common: "#9CA3AF",
    uncommon: "#22C55E",
    rare: "#3B82F6",
    epic: "#8B5CF6",
    legendary: "#F59E0B",
    unique: "#EF4444"
  };
  return colors[rarity];
}
function calculateRoyalty(salePrice, royaltyPercent) {
  return salePrice * (royaltyPercent / 100);
}
function getExplorerUrl(blockchain, type, id) {
  const explorers = {
    bsv: {
      tx: `https://whatsonchain.com/tx/${id}`,
      token: `https://whatsonchain.com/tx/${id}`,
      inscription: `https://1satordinals.com/inscription/${id}`
    },
    bitcoin: {
      tx: `https://mempool.space/tx/${id}`,
      inscription: `https://ordinals.com/inscription/${id}`
    },
    ethereum: {
      tx: `https://etherscan.io/tx/${id}`,
      token: `https://etherscan.io/token/${id}`
    },
    solana: {
      tx: `https://solscan.io/tx/${id}`,
      token: `https://solscan.io/token/${id}`
    }
  };
  return explorers[blockchain]?.[type] || "";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CONTENT_TYPE_MIMES,
  DEFAULT_MINT_OPTIONS,
  DEFAULT_MODAL_CONFIG,
  DEFAULT_STEPS,
  MintingManager,
  calculateRoyalty,
  createMintingManager,
  formatFileSize,
  generateMetadataJson,
  getContentType,
  getExplorerUrl,
  getRarityColor
});
//# sourceMappingURL=index.cjs.map