/**
 * Path402 Network Flow Template
 * 
 * Describes the overlay network architecture as a Cashboard workflow.
 * This template can be loaded in both standalone Cashboard and b0ase.com/cashboard.
 * 
 * The network consists of:
 * - Payment Endpoints (domains, handles, addresses)
 * - Indexer Nodes (watch for payments)
 * - Distribution Engine (divvyd)
 * - Token Holders (receive dividends)
 */

import { WorkflowState, WorkflowNode, Connection } from '../app/types';

// Node configurations for Path402 Network
export const PATH402_NODE_TEMPLATES: Record<string, Partial<WorkflowNode>> = {
    // Payment Endpoints
    DOMAIN_ENDPOINT: {
        type: 'api',
        name: 'Domain Endpoint',
        description: 'Tokenized domain receiving payments (e.g., pay@b0ase.com)',
        status: 'active',
        metadata: {
            category: 'endpoint',
            icon: 'Globe',
            color: '#3b82f6',
        }
    },
    HANDLE_ENDPOINT: {
        type: 'wallets',
        name: 'Cash Handle',
        description: 'Tokenized HandCash handle (e.g., $BOASE)',
        status: 'active',
        metadata: {
            category: 'endpoint',
            icon: 'Wallet',
            color: '#10b981',
        }
    },
    ADDRESS_ENDPOINT: {
        type: 'wallets',
        name: 'Public Key Address',
        description: 'Raw BSV address endpoint',
        status: 'active',
        metadata: {
            category: 'endpoint',
            icon: 'Key',
            color: '#f59e0b',
        }
    },

    // Indexer Nodes
    INDEXER_NODE: {
        type: 'database',
        name: 'Indexer Node',
        description: 'Watches blockchain for payments to endpoints',
        status: 'active',
        metadata: {
            category: 'indexer',
            icon: 'Search',
            color: '#8b5cf6',
            isIncentivized: true,
        }
    },

    // Distribution Engine
    DIVVYD: {
        type: 'function',
        name: 'divvyd',
        description: 'Dividend distribution daemon',
        status: 'active',
        metadata: {
            category: 'engine',
            icon: 'Share2',
            color: '#ec4899',
        }
    },

    // Token Holders
    HOLDER_GROUP: {
        type: 'team',
        name: 'Token Holders',
        description: 'Holders receive pro-rata dividends',
        status: 'active',
        isExpanded: false,
        metadata: {
            category: 'recipients',
            icon: 'Users',
            color: '#06b6d4',
        }
    },

    // Overlay Network Peer
    PEER_NODE: {
        type: 'service',
        name: 'Peer Node',
        description: 'Path402 overlay network peer',
        status: 'active',
        metadata: {
            category: 'overlay',
            icon: 'Radio',
            color: '#84cc16',
            earnsRewards: true,
        }
    },

    // Token Reward
    TOKEN_REWARD: {
        type: 'mint',
        name: '$402 Token Reward',
        description: 'PoW20 token issued to incentivize indexers',
        status: 'pending',
        metadata: {
            category: 'incentive',
            icon: 'Coins',
            color: '#f97316',
            tokenType: 'pow20',
        }
    },
};

/**
 * Creates a basic Path402 Network workflow
 */
export function createPath402NetworkWorkflow(options?: {
    id?: string;
    withOverlay?: boolean;
    withTokenRewards?: boolean;
}): WorkflowState {
    const id = options?.id || `path402-network-${Date.now()}`;
    const withOverlay = options?.withOverlay ?? true;
    const withTokenRewards = options?.withTokenRewards ?? false;

    const nodes: WorkflowNode[] = [
        // Payment Endpoints (left side)
        {
            ...PATH402_NODE_TEMPLATES.DOMAIN_ENDPOINT,
            id: 'domain-1',
            name: 'b0ase.com',
            description: 'Domain token: pay@b0ase.com',
            x: 100,
            y: 100,
            connections: ['indexer-1'],
        } as WorkflowNode,
        {
            ...PATH402_NODE_TEMPLATES.HANDLE_ENDPOINT,
            id: 'handle-1',
            name: '$BOASE',
            description: 'Cash handle: BOASE@handcash.io',
            x: 100,
            y: 250,
            connections: ['indexer-1'],
        } as WorkflowNode,
        {
            ...PATH402_NODE_TEMPLATES.ADDRESS_ENDPOINT,
            id: 'address-1',
            name: '1ABC123...',
            description: 'Raw BSV address',
            x: 100,
            y: 400,
            connections: ['indexer-1'],
        } as WorkflowNode,

        // Indexer (center-left)
        {
            ...PATH402_NODE_TEMPLATES.INDEXER_NODE,
            id: 'indexer-1',
            name: 'Primary Indexer',
            description: 'Watches blockchain for incoming payments',
            x: 350,
            y: 250,
            connections: ['divvyd-1'],
        } as WorkflowNode,

        // divvyd (center)
        {
            ...PATH402_NODE_TEMPLATES.DIVVYD,
            id: 'divvyd-1',
            name: 'divvyd',
            description: 'Calculates pro-rata splits, sends payouts',
            x: 600,
            y: 250,
            connections: ['holders-1'],
        } as WorkflowNode,

        // Holders (right)
        {
            ...PATH402_NODE_TEMPLATES.HOLDER_GROUP,
            id: 'holders-1',
            name: 'Token Holders',
            description: 'Receive dividends proportional to holdings',
            x: 850,
            y: 250,
            connections: [],
            memberCount: 42,
        } as WorkflowNode,
    ];

    // Add overlay network peers if enabled
    if (withOverlay) {
        nodes.push(
            {
                ...PATH402_NODE_TEMPLATES.PEER_NODE,
                id: 'peer-a',
                name: 'Peer A',
                description: 'Relay indexer in NYC',
                x: 350,
                y: 50,
                connections: ['indexer-1', 'peer-b'],
            } as WorkflowNode,
            {
                ...PATH402_NODE_TEMPLATES.PEER_NODE,
                id: 'peer-b',
                name: 'Peer B',
                description: 'Relay indexer in London',
                x: 350,
                y: 450,
                connections: ['indexer-1', 'peer-a'],
            } as WorkflowNode,
        );
    }

    // Add token rewards if enabled
    if (withTokenRewards) {
        nodes.push(
            {
                ...PATH402_NODE_TEMPLATES.TOKEN_REWARD,
                id: 'token-reward-1',
                name: '$402 PoW20',
                description: 'Rewards for indexing work',
                x: 500,
                y: 50,
                connections: ['indexer-1', 'peer-a', 'peer-b'],
            } as WorkflowNode,
        );
    }

    const connections: Connection[] = [
        { id: 'c1', from: 'domain-1', to: 'indexer-1', type: 'payment' },
        { id: 'c2', from: 'handle-1', to: 'indexer-1', type: 'payment' },
        { id: 'c3', from: 'address-1', to: 'indexer-1', type: 'payment' },
        { id: 'c4', from: 'indexer-1', to: 'divvyd-1', type: 'success' },
        { id: 'c5', from: 'divvyd-1', to: 'holders-1', type: 'payment' },
    ];

    if (withOverlay) {
        connections.push(
            { id: 'c6', from: 'peer-a', to: 'indexer-1', type: 'success' },
            { id: 'c7', from: 'peer-b', to: 'indexer-1', type: 'success' },
            { id: 'c8', from: 'peer-a', to: 'peer-b', type: 'conditional' },
        );
    }

    if (withTokenRewards) {
        connections.push(
            { id: 'c9', from: 'token-reward-1', to: 'indexer-1', type: 'payment' },
            { id: 'c10', from: 'token-reward-1', to: 'peer-a', type: 'payment' },
            { id: 'c11', from: 'token-reward-1', to: 'peer-b', type: 'payment' },
        );
    }

    return {
        id,
        name: 'Path402 Network',
        description: 'Overlay network for tokenized payment endpoints and dividend distribution',
        nodes,
        connections,
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true,
    };
}

/**
 * Creates a minimal flow for HandCash tokenization (Divvy use case)
 */
export function createDivvyTokenizationWorkflow(handleName: string): WorkflowState {
    return createPath402NetworkWorkflow({
        id: `divvy-${handleName}-${Date.now()}`,
        withOverlay: false,
        withTokenRewards: false,
    });
}

/**
 * Creates a full overlay network flow with token incentives
 */
export function createFullOverlayNetworkWorkflow(): WorkflowState {
    return createPath402NetworkWorkflow({
        id: `overlay-network-${Date.now()}`,
        withOverlay: true,
        withTokenRewards: true,
    });
}

// Export template metadata for UI
export const PATH402_TEMPLATES = [
    {
        id: 'basic-dividend',
        name: 'Basic Dividend Flow',
        description: 'Simple payment endpoint → indexer → divvyd → holders',
        create: () => createPath402NetworkWorkflow({ withOverlay: false, withTokenRewards: false }),
    },
    {
        id: 'overlay-network',
        name: 'Overlay Network',
        description: 'Distributed indexer network with peer gossip',
        create: () => createPath402NetworkWorkflow({ withOverlay: true, withTokenRewards: false }),
    },
    {
        id: 'full-incentivized',
        name: 'Full Incentivized Network',
        description: 'Overlay network with $402 PoW20 token rewards for indexers',
        create: () => createPath402NetworkWorkflow({ withOverlay: true, withTokenRewards: true }),
    },
];

export default {
    PATH402_NODE_TEMPLATES,
    PATH402_TEMPLATES,
    createPath402NetworkWorkflow,
    createDivvyTokenizationWorkflow,
    createFullOverlayNetworkWorkflow,
};
