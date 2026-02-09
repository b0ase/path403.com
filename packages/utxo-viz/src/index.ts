/**
 * @b0ase/utxo-viz
 *
 * UTXO visualization with 3D bubble representation.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** UTXO status */
export type UTXOStatus = 'unspent' | 'pending' | 'spent' | 'locked';

/** Color scheme */
export type ColorScheme = 'value' | 'age' | 'type' | 'status' | 'custom';

/** Layout type */
export type LayoutType = 'packed' | 'grid' | 'spiral' | 'tree' | 'force';

/** UTXO data */
export interface UTXO {
  txid: string;
  vout: number;
  value: bigint;
  address: string;
  scriptPubKey: string;
  confirmations: number;
  blockHeight?: number;
  timestamp?: Date;
  status: UTXOStatus;
  label?: string;
  metadata?: Record<string, unknown>;
}

/** UTXO bubble (visual representation) */
export interface UTXOBubble {
  utxo: UTXO;
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  opacity: number;
  scale: number;
  selected: boolean;
  hovered: boolean;
  clusterId?: string;
}

/** Cluster */
export interface UTXOCluster {
  id: string;
  label: string;
  utxos: string[];
  totalValue: bigint;
  color: string;
  center: { x: number; y: number; z: number };
  radius: number;
}

/** Visualization config */
export interface VisualizationConfig {
  layout: LayoutType;
  colorScheme: ColorScheme;
  minRadius: number;
  maxRadius: number;
  spacing: number;
  use3D: boolean;
  showLabels: boolean;
  showValues: boolean;
  enableClustering: boolean;
  clusterThreshold: number;
  animationDuration: number;
  customColors?: Record<string, string>;
}

/** Camera state */
export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
  rotation: { x: number; y: number };
}

/** Selection state */
export interface SelectionState {
  selectedIds: string[];
  hoveredId?: string;
  multiSelect: boolean;
}

/** Stats */
export interface UTXOStats {
  totalCount: number;
  totalValue: bigint;
  avgValue: bigint;
  minValue: bigint;
  maxValue: bigint;
  byStatus: Record<UTXOStatus, { count: number; value: bigint }>;
  byAge: { recent: number; medium: number; old: number };
}

/** Animation state */
export interface AnimationState {
  isAnimating: boolean;
  progress: number;
  startPositions: Map<string, { x: number; y: number; z: number }>;
  endPositions: Map<string, { x: number; y: number; z: number }>;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: VisualizationConfig = {
  layout: 'packed',
  colorScheme: 'value',
  minRadius: 5,
  maxRadius: 50,
  spacing: 2,
  use3D: true,
  showLabels: true,
  showValues: true,
  enableClustering: false,
  clusterThreshold: 10,
  animationDuration: 500,
};

export const VALUE_COLORS = {
  dust: '#9CA3AF',      // < 1000 sats
  small: '#60A5FA',     // < 100k sats
  medium: '#34D399',    // < 1M sats
  large: '#FBBF24',     // < 10M sats
  whale: '#F472B6',     // >= 10M sats
};

export const AGE_COLORS = {
  fresh: '#22C55E',     // < 6 confirmations
  recent: '#3B82F6',    // < 100 blocks
  mature: '#8B5CF6',    // < 1000 blocks
  old: '#F59E0B',       // >= 1000 blocks
};

export const STATUS_COLORS: Record<UTXOStatus, string> = {
  unspent: '#22C55E',
  pending: '#FBBF24',
  spent: '#6B7280',
  locked: '#EF4444',
};

// ============================================================================
// UTXO Visualizer
// ============================================================================

export class UTXOVisualizer {
  private utxos: Map<string, UTXO> = new Map();
  private bubbles: Map<string, UTXOBubble> = new Map();
  private clusters: Map<string, UTXOCluster> = new Map();
  private config: VisualizationConfig;
  private camera: CameraState;
  private selection: SelectionState;
  private animation: AnimationState;

  constructor(config?: Partial<VisualizationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.camera = {
      position: { x: 0, y: 0, z: 100 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1,
      rotation: { x: 0, y: 0 },
    };
    this.selection = {
      selectedIds: [],
      multiSelect: false,
    };
    this.animation = {
      isAnimating: false,
      progress: 0,
      startPositions: new Map(),
      endPositions: new Map(),
    };
  }

  // ==========================================================================
  // Data Management
  // ==========================================================================

  setUTXOs(utxos: UTXO[]): void {
    this.utxos.clear();
    for (const utxo of utxos) {
      const id = this.getUTXOId(utxo);
      this.utxos.set(id, utxo);
    }
    this.generateBubbles();
  }

  addUTXO(utxo: UTXO): void {
    const id = this.getUTXOId(utxo);
    this.utxos.set(id, utxo);
    this.generateBubbles();
  }

  removeUTXO(txid: string, vout: number): void {
    const id = `${txid}:${vout}`;
    this.utxos.delete(id);
    this.bubbles.delete(id);
  }

  updateUTXO(utxo: UTXO): void {
    const id = this.getUTXOId(utxo);
    this.utxos.set(id, utxo);
    const bubble = this.bubbles.get(id);
    if (bubble) {
      bubble.utxo = utxo;
      bubble.color = this.getColor(utxo);
    }
  }

  getUTXO(id: string): UTXO | undefined {
    return this.utxos.get(id);
  }

  getAllUTXOs(): UTXO[] {
    return Array.from(this.utxos.values());
  }

  // ==========================================================================
  // Bubble Generation
  // ==========================================================================

  private generateBubbles(): void {
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
        opacity: utxo.status === 'spent' ? 0.3 : 1,
        scale: 1,
        selected: this.selection.selectedIds.includes(id),
        hovered: this.selection.hoveredId === id,
      });
    }

    if (this.config.enableClustering) {
      this.generateClusters();
    }
  }

  private calculateLayout(utxos: UTXO[]): Array<{ x: number; y: number; z: number }> {
    switch (this.config.layout) {
      case 'grid':
        return this.gridLayout(utxos);
      case 'spiral':
        return this.spiralLayout(utxos);
      case 'force':
        return this.forceLayout(utxos);
      case 'packed':
      default:
        return this.packedLayout(utxos);
    }
  }

  private packedLayout(utxos: UTXO[]): Array<{ x: number; y: number; z: number }> {
    const positions: Array<{ x: number; y: number; z: number }> = [];
    const placed: Array<{ x: number; y: number; z: number; r: number }> = [];

    // Sort by value (larger first for better packing)
    const sorted = [...utxos].sort((a, b) => Number(b.value - a.value));

    for (const utxo of sorted) {
      const radius = this.calculateRadius(utxo);
      const pos = this.findPackingPosition(placed, radius);
      positions.push(pos);
      placed.push({ ...pos, r: radius });
    }

    // Reorder to match original utxo order
    const result: Array<{ x: number; y: number; z: number }> = [];
    for (const utxo of utxos) {
      const idx = sorted.indexOf(utxo);
      result.push(positions[idx]);
    }

    return result;
  }

  private findPackingPosition(
    placed: Array<{ x: number; y: number; z: number; r: number }>,
    radius: number
  ): { x: number; y: number; z: number } {
    if (placed.length === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    // Simple spiral outward search
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

    // Fallback: just place it somewhere
    return {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      z: this.config.use3D ? (Math.random() - 0.5) * 50 : 0,
    };
  }

  private gridLayout(utxos: UTXO[]): Array<{ x: number; y: number; z: number }> {
    const cols = Math.ceil(Math.sqrt(utxos.length));
    const spacing = this.config.maxRadius * 2 + this.config.spacing;

    return utxos.map((_, i) => ({
      x: (i % cols) * spacing - (cols * spacing) / 2,
      y: Math.floor(i / cols) * spacing - (Math.ceil(utxos.length / cols) * spacing) / 2,
      z: 0,
    }));
  }

  private spiralLayout(utxos: UTXO[]): Array<{ x: number; y: number; z: number }> {
    return utxos.map((_, i) => {
      const angle = i * 0.5;
      const radius = 10 + i * 3;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: this.config.use3D ? i * 0.5 : 0,
      };
    });
  }

  private forceLayout(utxos: UTXO[]): Array<{ x: number; y: number; z: number }> {
    // Simple force simulation
    const positions = utxos.map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      z: this.config.use3D ? (Math.random() - 0.5) * 50 : 0,
    }));

    // Run a few iterations
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

  private generateClusters(): void {
    this.clusters.clear();

    if (!this.config.enableClustering) return;

    // Simple clustering by address
    const byAddress = new Map<string, UTXO[]>();
    for (const utxo of this.utxos.values()) {
      const existing = byAddress.get(utxo.address) || [];
      existing.push(utxo);
      byAddress.set(utxo.address, existing);
    }

    let clusterIndex = 0;
    for (const [address, utxos] of byAddress) {
      if (utxos.length < this.config.clusterThreshold) continue;

      const clusterId = `cluster-${clusterIndex++}`;
      const utxoIds = utxos.map(u => this.getUTXOId(u));
      const totalValue = utxos.reduce((sum, u) => sum + u.value, BigInt(0));

      // Calculate cluster center
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
        radius: Math.sqrt(utxoIds.length) * this.config.maxRadius,
      });

      // Mark bubbles with cluster
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

  private calculateRadius(utxo: UTXO): number {
    const value = Number(utxo.value);
    const logValue = Math.log10(value + 1);
    const maxLog = Math.log10(100000000); // 1 BTC in sats
    const normalized = Math.min(logValue / maxLog, 1);

    return this.config.minRadius +
      (this.config.maxRadius - this.config.minRadius) * normalized;
  }

  private getColor(utxo: UTXO): string {
    switch (this.config.colorScheme) {
      case 'value':
        return this.getValueColor(utxo.value);
      case 'age':
        return this.getAgeColor(utxo.confirmations);
      case 'status':
        return STATUS_COLORS[utxo.status];
      case 'custom':
        return this.config.customColors?.[utxo.address] || VALUE_COLORS.medium;
      default:
        return this.getValueColor(utxo.value);
    }
  }

  private getValueColor(value: bigint): string {
    const sats = Number(value);
    if (sats < 1000) return VALUE_COLORS.dust;
    if (sats < 100000) return VALUE_COLORS.small;
    if (sats < 1000000) return VALUE_COLORS.medium;
    if (sats < 10000000) return VALUE_COLORS.large;
    return VALUE_COLORS.whale;
  }

  private getAgeColor(confirmations: number): string {
    if (confirmations < 6) return AGE_COLORS.fresh;
    if (confirmations < 100) return AGE_COLORS.recent;
    if (confirmations < 1000) return AGE_COLORS.mature;
    return AGE_COLORS.old;
  }

  // ==========================================================================
  // Interaction
  // ==========================================================================

  select(id: string, multi = false): void {
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

  clearSelection(): void {
    this.selection.selectedIds = [];
    for (const bubble of this.bubbles.values()) {
      bubble.selected = false;
    }
  }

  hover(id: string | undefined): void {
    this.selection.hoveredId = id;
    for (const bubble of this.bubbles.values()) {
      bubble.hovered = bubble.id === id;
    }
  }

  // ==========================================================================
  // Output
  // ==========================================================================

  getBubbles(): UTXOBubble[] {
    return Array.from(this.bubbles.values());
  }

  getClusters(): UTXOCluster[] {
    return Array.from(this.clusters.values());
  }

  getStats(): UTXOStats {
    const utxos = Array.from(this.utxos.values());
    const values = utxos.map(u => u.value);

    const byStatus: Record<UTXOStatus, { count: number; value: bigint }> = {
      unspent: { count: 0, value: BigInt(0) },
      pending: { count: 0, value: BigInt(0) },
      spent: { count: 0, value: BigInt(0) },
      locked: { count: 0, value: BigInt(0) },
    };

    let recent = 0, medium = 0, old = 0;

    for (const utxo of utxos) {
      byStatus[utxo.status].count++;
      byStatus[utxo.status].value += utxo.value;

      if (utxo.confirmations < 100) recent++;
      else if (utxo.confirmations < 1000) medium++;
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
      byAge: { recent, medium, old },
    };
  }

  getCamera(): CameraState {
    return { ...this.camera };
  }

  setCamera(camera: Partial<CameraState>): void {
    Object.assign(this.camera, camera);
  }

  getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.generateBubbles();
  }

  private getUTXOId(utxo: UTXO): string {
    return `${utxo.txid}:${utxo.vout}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createUTXOVisualizer(config?: Partial<VisualizationConfig>): UTXOVisualizer {
  return new UTXOVisualizer(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatSatoshis(sats: bigint): string {
  const btc = Number(sats) / 100000000;
  if (btc >= 1) return `${btc.toFixed(8)} BSV`;
  if (Number(sats) >= 1000000) return `${(Number(sats) / 1000000).toFixed(2)}M sats`;
  if (Number(sats) >= 1000) return `${(Number(sats) / 1000).toFixed(2)}K sats`;
  return `${sats} sats`;
}

export function getUTXOAge(confirmations: number): string {
  if (confirmations === 0) return 'Unconfirmed';
  if (confirmations < 6) return 'Confirming';
  if (confirmations < 100) return 'Recent';
  if (confirmations < 1000) return 'Mature';
  return 'Old';
}

export function sortUTXOs(utxos: UTXO[], by: 'value' | 'age' | 'status'): UTXO[] {
  return [...utxos].sort((a, b) => {
    switch (by) {
      case 'value':
        return Number(b.value - a.value);
      case 'age':
        return b.confirmations - a.confirmations;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
}

export function filterUTXOs(
  utxos: UTXO[],
  filters: {
    minValue?: bigint;
    maxValue?: bigint;
    status?: UTXOStatus[];
    minConfirmations?: number;
  }
): UTXO[] {
  return utxos.filter(utxo => {
    if (filters.minValue && utxo.value < filters.minValue) return false;
    if (filters.maxValue && utxo.value > filters.maxValue) return false;
    if (filters.status && !filters.status.includes(utxo.status)) return false;
    if (filters.minConfirmations && utxo.confirmations < filters.minConfirmations) return false;
    return true;
  });
}
