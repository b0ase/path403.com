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
  AGE_COLORS: () => AGE_COLORS,
  DEFAULT_CONFIG: () => DEFAULT_CONFIG,
  STATUS_COLORS: () => STATUS_COLORS,
  UTXOVisualizer: () => UTXOVisualizer,
  VALUE_COLORS: () => VALUE_COLORS,
  createUTXOVisualizer: () => createUTXOVisualizer,
  filterUTXOs: () => filterUTXOs,
  formatSatoshis: () => formatSatoshis,
  getUTXOAge: () => getUTXOAge,
  sortUTXOs: () => sortUTXOs
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_CONFIG = {
  layout: "packed",
  colorScheme: "value",
  minRadius: 5,
  maxRadius: 50,
  spacing: 2,
  use3D: true,
  showLabels: true,
  showValues: true,
  enableClustering: false,
  clusterThreshold: 10,
  animationDuration: 500
};
var VALUE_COLORS = {
  dust: "#9CA3AF",
  // < 1000 sats
  small: "#60A5FA",
  // < 100k sats
  medium: "#34D399",
  // < 1M sats
  large: "#FBBF24",
  // < 10M sats
  whale: "#F472B6"
  // >= 10M sats
};
var AGE_COLORS = {
  fresh: "#22C55E",
  // < 6 confirmations
  recent: "#3B82F6",
  // < 100 blocks
  mature: "#8B5CF6",
  // < 1000 blocks
  old: "#F59E0B"
  // >= 1000 blocks
};
var STATUS_COLORS = {
  unspent: "#22C55E",
  pending: "#FBBF24",
  spent: "#6B7280",
  locked: "#EF4444"
};
var UTXOVisualizer = class {
  constructor(config) {
    this.utxos = /* @__PURE__ */ new Map();
    this.bubbles = /* @__PURE__ */ new Map();
    this.clusters = /* @__PURE__ */ new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.camera = {
      position: { x: 0, y: 0, z: 100 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1,
      rotation: { x: 0, y: 0 }
    };
    this.selection = {
      selectedIds: [],
      multiSelect: false
    };
    this.animation = {
      isAnimating: false,
      progress: 0,
      startPositions: /* @__PURE__ */ new Map(),
      endPositions: /* @__PURE__ */ new Map()
    };
  }
  // ==========================================================================
  // Data Management
  // ==========================================================================
  setUTXOs(utxos) {
    this.utxos.clear();
    for (const utxo of utxos) {
      const id = this.getUTXOId(utxo);
      this.utxos.set(id, utxo);
    }
    this.generateBubbles();
  }
  addUTXO(utxo) {
    const id = this.getUTXOId(utxo);
    this.utxos.set(id, utxo);
    this.generateBubbles();
  }
  removeUTXO(txid, vout) {
    const id = `${txid}:${vout}`;
    this.utxos.delete(id);
    this.bubbles.delete(id);
  }
  updateUTXO(utxo) {
    const id = this.getUTXOId(utxo);
    this.utxos.set(id, utxo);
    const bubble = this.bubbles.get(id);
    if (bubble) {
      bubble.utxo = utxo;
      bubble.color = this.getColor(utxo);
    }
  }
  getUTXO(id) {
    return this.utxos.get(id);
  }
  getAllUTXOs() {
    return Array.from(this.utxos.values());
  }
  // ==========================================================================
  // Bubble Generation
  // ==========================================================================
  generateBubbles() {
    const utxoArray = Array.from(this.utxos.values());
    const positions = this.calculateLayout(utxoArray);
    this.bubbles.clear();
    for (let i = 0; i < utxoArray.length; i++) {
      const utxo = utxoArray[i];
      const id = this.getUTXOId(utxo);
      const pos = positions[i];
      this.bubbles.set(id, {
        utxo,
        id,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        radius: this.calculateRadius(utxo),
        color: this.getColor(utxo),
        opacity: utxo.status === "spent" ? 0.3 : 1,
        scale: 1,
        selected: this.selection.selectedIds.includes(id),
        hovered: this.selection.hoveredId === id
      });
    }
    if (this.config.enableClustering) {
      this.generateClusters();
    }
  }
  calculateLayout(utxos) {
    switch (this.config.layout) {
      case "grid":
        return this.gridLayout(utxos);
      case "spiral":
        return this.spiralLayout(utxos);
      case "force":
        return this.forceLayout(utxos);
      case "packed":
      default:
        return this.packedLayout(utxos);
    }
  }
  packedLayout(utxos) {
    const positions = [];
    const placed = [];
    const sorted = [...utxos].sort((a, b) => Number(b.value - a.value));
    for (const utxo of sorted) {
      const radius = this.calculateRadius(utxo);
      const pos = this.findPackingPosition(placed, radius);
      positions.push(pos);
      placed.push({ ...pos, r: radius });
    }
    const result = [];
    for (const utxo of utxos) {
      const idx = sorted.indexOf(utxo);
      result.push(positions[idx]);
    }
    return result;
  }
  findPackingPosition(placed, radius) {
    if (placed.length === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    const spacing = this.config.spacing;
    for (let angle = 0; angle < Math.PI * 20; angle += 0.1) {
      const distance = angle * 5;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const z = this.config.use3D ? (Math.random() - 0.5) * 20 : 0;
      let valid = true;
      for (const p of placed) {
        const dx = x - p.x;
        const dy = y - p.y;
        const dz = z - p.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < radius + p.r + spacing) {
          valid = false;
          break;
        }
      }
      if (valid) {
        return { x, y, z };
      }
    }
    return {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      z: this.config.use3D ? (Math.random() - 0.5) * 50 : 0
    };
  }
  gridLayout(utxos) {
    const cols = Math.ceil(Math.sqrt(utxos.length));
    const spacing = this.config.maxRadius * 2 + this.config.spacing;
    return utxos.map((_, i) => ({
      x: i % cols * spacing - cols * spacing / 2,
      y: Math.floor(i / cols) * spacing - Math.ceil(utxos.length / cols) * spacing / 2,
      z: 0
    }));
  }
  spiralLayout(utxos) {
    return utxos.map((_, i) => {
      const angle = i * 0.5;
      const radius = 10 + i * 3;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: this.config.use3D ? i * 0.5 : 0
      };
    });
  }
  forceLayout(utxos) {
    const positions = utxos.map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      z: this.config.use3D ? (Math.random() - 0.5) * 50 : 0
    }));
    for (let iter = 0; iter < 50; iter++) {
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[j].x - positions[i].x;
          const dy = positions[j].y - positions[i].y;
          const dz = positions[j].z - positions[i].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const minDist = this.config.maxRadius * 2 + this.config.spacing;
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.5;
            positions[i].x -= dx * force;
            positions[i].y -= dy * force;
            positions[i].z -= dz * force;
            positions[j].x += dx * force;
            positions[j].y += dy * force;
            positions[j].z += dz * force;
          }
        }
      }
    }
    return positions;
  }
  // ==========================================================================
  // Clustering
  // ==========================================================================
  generateClusters() {
    this.clusters.clear();
    if (!this.config.enableClustering) return;
    const byAddress = /* @__PURE__ */ new Map();
    for (const utxo of this.utxos.values()) {
      const existing = byAddress.get(utxo.address) || [];
      existing.push(utxo);
      byAddress.set(utxo.address, existing);
    }
    let clusterIndex = 0;
    for (const [address, utxos] of byAddress) {
      if (utxos.length < this.config.clusterThreshold) continue;
      const clusterId = `cluster-${clusterIndex++}`;
      const utxoIds = utxos.map((u) => this.getUTXOId(u));
      const totalValue = utxos.reduce((sum, u) => sum + u.value, BigInt(0));
      let cx = 0, cy = 0, cz = 0;
      for (const id of utxoIds) {
        const bubble = this.bubbles.get(id);
        if (bubble) {
          cx += bubble.x;
          cy += bubble.y;
          cz += bubble.z;
        }
      }
      cx /= utxoIds.length;
      cy /= utxoIds.length;
      cz /= utxoIds.length;
      this.clusters.set(clusterId, {
        id: clusterId,
        label: `${address.slice(0, 8)}...`,
        utxos: utxoIds,
        totalValue,
        color: this.getValueColor(totalValue),
        center: { x: cx, y: cy, z: cz },
        radius: Math.sqrt(utxoIds.length) * this.config.maxRadius
      });
      for (const id of utxoIds) {
        const bubble = this.bubbles.get(id);
        if (bubble) {
          bubble.clusterId = clusterId;
        }
      }
    }
  }
  // ==========================================================================
  // Styling
  // ==========================================================================
  calculateRadius(utxo) {
    const value = Number(utxo.value);
    const logValue = Math.log10(value + 1);
    const maxLog = Math.log10(1e8);
    const normalized = Math.min(logValue / maxLog, 1);
    return this.config.minRadius + (this.config.maxRadius - this.config.minRadius) * normalized;
  }
  getColor(utxo) {
    switch (this.config.colorScheme) {
      case "value":
        return this.getValueColor(utxo.value);
      case "age":
        return this.getAgeColor(utxo.confirmations);
      case "status":
        return STATUS_COLORS[utxo.status];
      case "custom":
        return this.config.customColors?.[utxo.address] || VALUE_COLORS.medium;
      default:
        return this.getValueColor(utxo.value);
    }
  }
  getValueColor(value) {
    const sats = Number(value);
    if (sats < 1e3) return VALUE_COLORS.dust;
    if (sats < 1e5) return VALUE_COLORS.small;
    if (sats < 1e6) return VALUE_COLORS.medium;
    if (sats < 1e7) return VALUE_COLORS.large;
    return VALUE_COLORS.whale;
  }
  getAgeColor(confirmations) {
    if (confirmations < 6) return AGE_COLORS.fresh;
    if (confirmations < 100) return AGE_COLORS.recent;
    if (confirmations < 1e3) return AGE_COLORS.mature;
    return AGE_COLORS.old;
  }
  // ==========================================================================
  // Interaction
  // ==========================================================================
  select(id, multi = false) {
    if (multi) {
      const idx = this.selection.selectedIds.indexOf(id);
      if (idx >= 0) {
        this.selection.selectedIds.splice(idx, 1);
      } else {
        this.selection.selectedIds.push(id);
      }
    } else {
      this.selection.selectedIds = [id];
    }
    for (const bubble of this.bubbles.values()) {
      bubble.selected = this.selection.selectedIds.includes(bubble.id);
    }
  }
  clearSelection() {
    this.selection.selectedIds = [];
    for (const bubble of this.bubbles.values()) {
      bubble.selected = false;
    }
  }
  hover(id) {
    this.selection.hoveredId = id;
    for (const bubble of this.bubbles.values()) {
      bubble.hovered = bubble.id === id;
    }
  }
  // ==========================================================================
  // Output
  // ==========================================================================
  getBubbles() {
    return Array.from(this.bubbles.values());
  }
  getClusters() {
    return Array.from(this.clusters.values());
  }
  getStats() {
    const utxos = Array.from(this.utxos.values());
    const values = utxos.map((u) => u.value);
    const byStatus = {
      unspent: { count: 0, value: BigInt(0) },
      pending: { count: 0, value: BigInt(0) },
      spent: { count: 0, value: BigInt(0) },
      locked: { count: 0, value: BigInt(0) }
    };
    let recent = 0, medium = 0, old = 0;
    for (const utxo of utxos) {
      byStatus[utxo.status].count++;
      byStatus[utxo.status].value += utxo.value;
      if (utxo.confirmations < 100) recent++;
      else if (utxo.confirmations < 1e3) medium++;
      else old++;
    }
    const totalValue = values.reduce((a, b) => a + b, BigInt(0));
    return {
      totalCount: utxos.length,
      totalValue,
      avgValue: utxos.length > 0 ? totalValue / BigInt(utxos.length) : BigInt(0),
      minValue: values.length > 0 ? values.reduce((a, b) => a < b ? a : b) : BigInt(0),
      maxValue: values.length > 0 ? values.reduce((a, b) => a > b ? a : b) : BigInt(0),
      byStatus,
      byAge: { recent, medium, old }
    };
  }
  getCamera() {
    return { ...this.camera };
  }
  setCamera(camera) {
    Object.assign(this.camera, camera);
  }
  getConfig() {
    return { ...this.config };
  }
  setConfig(config) {
    this.config = { ...this.config, ...config };
    this.generateBubbles();
  }
  getUTXOId(utxo) {
    return `${utxo.txid}:${utxo.vout}`;
  }
};
function createUTXOVisualizer(config) {
  return new UTXOVisualizer(config);
}
function formatSatoshis(sats) {
  const btc = Number(sats) / 1e8;
  if (btc >= 1) return `${btc.toFixed(8)} BSV`;
  if (Number(sats) >= 1e6) return `${(Number(sats) / 1e6).toFixed(2)}M sats`;
  if (Number(sats) >= 1e3) return `${(Number(sats) / 1e3).toFixed(2)}K sats`;
  return `${sats} sats`;
}
function getUTXOAge(confirmations) {
  if (confirmations === 0) return "Unconfirmed";
  if (confirmations < 6) return "Confirming";
  if (confirmations < 100) return "Recent";
  if (confirmations < 1e3) return "Mature";
  return "Old";
}
function sortUTXOs(utxos, by) {
  return [...utxos].sort((a, b) => {
    switch (by) {
      case "value":
        return Number(b.value - a.value);
      case "age":
        return b.confirmations - a.confirmations;
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
}
function filterUTXOs(utxos, filters) {
  return utxos.filter((utxo) => {
    if (filters.minValue && utxo.value < filters.minValue) return false;
    if (filters.maxValue && utxo.value > filters.maxValue) return false;
    if (filters.status && !filters.status.includes(utxo.status)) return false;
    if (filters.minConfirmations && utxo.confirmations < filters.minConfirmations) return false;
    return true;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AGE_COLORS,
  DEFAULT_CONFIG,
  STATUS_COLORS,
  UTXOVisualizer,
  VALUE_COLORS,
  createUTXOVisualizer,
  filterUTXOs,
  formatSatoshis,
  getUTXOAge,
  sortUTXOs
});
//# sourceMappingURL=index.cjs.map