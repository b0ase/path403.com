/**
 * @b0ase/utxo-viz
 *
 * UTXO visualization with 3D bubble representation.
 *
 * @packageDocumentation
 */
/** UTXO status */
type UTXOStatus = 'unspent' | 'pending' | 'spent' | 'locked';
/** Color scheme */
type ColorScheme = 'value' | 'age' | 'type' | 'status' | 'custom';
/** Layout type */
type LayoutType = 'packed' | 'grid' | 'spiral' | 'tree' | 'force';
/** UTXO data */
interface UTXO {
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
interface UTXOBubble {
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
interface UTXOCluster {
    id: string;
    label: string;
    utxos: string[];
    totalValue: bigint;
    color: string;
    center: {
        x: number;
        y: number;
        z: number;
    };
    radius: number;
}
/** Visualization config */
interface VisualizationConfig {
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
interface CameraState {
    position: {
        x: number;
        y: number;
        z: number;
    };
    target: {
        x: number;
        y: number;
        z: number;
    };
    zoom: number;
    rotation: {
        x: number;
        y: number;
    };
}
/** Selection state */
interface SelectionState {
    selectedIds: string[];
    hoveredId?: string;
    multiSelect: boolean;
}
/** Stats */
interface UTXOStats {
    totalCount: number;
    totalValue: bigint;
    avgValue: bigint;
    minValue: bigint;
    maxValue: bigint;
    byStatus: Record<UTXOStatus, {
        count: number;
        value: bigint;
    }>;
    byAge: {
        recent: number;
        medium: number;
        old: number;
    };
}
/** Animation state */
interface AnimationState {
    isAnimating: boolean;
    progress: number;
    startPositions: Map<string, {
        x: number;
        y: number;
        z: number;
    }>;
    endPositions: Map<string, {
        x: number;
        y: number;
        z: number;
    }>;
}
declare const DEFAULT_CONFIG: VisualizationConfig;
declare const VALUE_COLORS: {
    dust: string;
    small: string;
    medium: string;
    large: string;
    whale: string;
};
declare const AGE_COLORS: {
    fresh: string;
    recent: string;
    mature: string;
    old: string;
};
declare const STATUS_COLORS: Record<UTXOStatus, string>;
declare class UTXOVisualizer {
    private utxos;
    private bubbles;
    private clusters;
    private config;
    private camera;
    private selection;
    private animation;
    constructor(config?: Partial<VisualizationConfig>);
    setUTXOs(utxos: UTXO[]): void;
    addUTXO(utxo: UTXO): void;
    removeUTXO(txid: string, vout: number): void;
    updateUTXO(utxo: UTXO): void;
    getUTXO(id: string): UTXO | undefined;
    getAllUTXOs(): UTXO[];
    private generateBubbles;
    private calculateLayout;
    private packedLayout;
    private findPackingPosition;
    private gridLayout;
    private spiralLayout;
    private forceLayout;
    private generateClusters;
    private calculateRadius;
    private getColor;
    private getValueColor;
    private getAgeColor;
    select(id: string, multi?: boolean): void;
    clearSelection(): void;
    hover(id: string | undefined): void;
    getBubbles(): UTXOBubble[];
    getClusters(): UTXOCluster[];
    getStats(): UTXOStats;
    getCamera(): CameraState;
    setCamera(camera: Partial<CameraState>): void;
    getConfig(): VisualizationConfig;
    setConfig(config: Partial<VisualizationConfig>): void;
    private getUTXOId;
}
declare function createUTXOVisualizer(config?: Partial<VisualizationConfig>): UTXOVisualizer;
declare function formatSatoshis(sats: bigint): string;
declare function getUTXOAge(confirmations: number): string;
declare function sortUTXOs(utxos: UTXO[], by: 'value' | 'age' | 'status'): UTXO[];
declare function filterUTXOs(utxos: UTXO[], filters: {
    minValue?: bigint;
    maxValue?: bigint;
    status?: UTXOStatus[];
    minConfirmations?: number;
}): UTXO[];

export { AGE_COLORS, type AnimationState, type CameraState, type ColorScheme, DEFAULT_CONFIG, type LayoutType, STATUS_COLORS, type SelectionState, type UTXO, type UTXOBubble, type UTXOCluster, type UTXOStats, type UTXOStatus, UTXOVisualizer, VALUE_COLORS, type VisualizationConfig, createUTXOVisualizer, filterUTXOs, formatSatoshis, getUTXOAge, sortUTXOs };
