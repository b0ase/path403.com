/**
 * @b0ase/version-tree
 *
 * Git-like version tree visualization and management.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Commit type */
export type CommitType = 'initial' | 'update' | 'merge' | 'revert' | 'tag';

/** Branch status */
export type BranchStatus = 'active' | 'merged' | 'abandoned' | 'protected';

/** Commit node */
export interface Commit {
  id: string;
  hash: string;
  shortHash: string;
  message: string;
  description?: string;
  author: Author;
  timestamp: Date;
  parentIds: string[];
  branchId: string;
  type: CommitType;
  tags: string[];
  metadata?: Record<string, unknown>;
  /** Content hash for verification */
  contentHash?: string;
  /** Blockchain inscription ID */
  inscriptionId?: string;
}

/** Author */
export interface Author {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

/** Branch */
export interface Branch {
  id: string;
  name: string;
  description?: string;
  status: BranchStatus;
  headCommitId: string;
  baseCommitId: string;
  createdAt: Date;
  createdBy: Author;
  mergedAt?: Date;
  mergedInto?: string;
  isDefault: boolean;
  isProtected: boolean;
}

/** Tag */
export interface Tag {
  id: string;
  name: string;
  commitId: string;
  message?: string;
  createdAt: Date;
  createdBy: Author;
  isRelease: boolean;
  releaseNotes?: string;
}

/** Version tree */
export interface VersionTree {
  id: string;
  name: string;
  description?: string;
  branches: Branch[];
  commits: Commit[];
  tags: Tag[];
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Tree visualization node */
export interface TreeNode {
  commit: Commit;
  x: number;
  y: number;
  column: number;
  row: number;
  color: string;
  connections: TreeConnection[];
}

/** Tree connection */
export interface TreeConnection {
  fromId: string;
  toId: string;
  type: 'parent' | 'merge';
  color: string;
  path: string;
}

/** Diff */
export interface Diff {
  fromCommitId: string;
  toCommitId: string;
  additions: number;
  deletions: number;
  changes: DiffChange[];
}

/** Diff change */
export interface DiffChange {
  path: string;
  type: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  additions: number;
  deletions: number;
}

// ============================================================================
// Version Tree Manager
// ============================================================================

export class VersionTreeManager {
  private tree: VersionTree;

  constructor(name: string, description?: string) {
    const now = new Date();
    this.tree = {
      id: this.generateId('tree'),
      name,
      description,
      branches: [],
      commits: [],
      tags: [],
      defaultBranch: 'main',
      createdAt: now,
      updatedAt: now,
    };

    // Create default branch
    this.createBranch('main', undefined, { isDefault: true });
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHash(): string {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  // ==========================================================================
  // Branch Operations
  // ==========================================================================

  createBranch(
    name: string,
    fromCommitId?: string,
    options?: { isDefault?: boolean; isProtected?: boolean; author?: Author }
  ): Branch {
    const author = options?.author || { id: 'system', name: 'System' };
    const baseCommitId = fromCommitId || this.tree.commits[this.tree.commits.length - 1]?.id || '';

    const branch: Branch = {
      id: this.generateId('branch'),
      name,
      status: 'active',
      headCommitId: baseCommitId,
      baseCommitId,
      createdAt: new Date(),
      createdBy: author,
      isDefault: options?.isDefault || false,
      isProtected: options?.isProtected || false,
    };

    this.tree.branches.push(branch);

    if (options?.isDefault) {
      this.tree.defaultBranch = name;
    }

    this.tree.updatedAt = new Date();
    return branch;
  }

  getBranch(nameOrId: string): Branch | undefined {
    return this.tree.branches.find(b => b.id === nameOrId || b.name === nameOrId);
  }

  mergeBranch(sourceBranch: string, targetBranch: string, author: Author, message?: string): Commit {
    const source = this.getBranch(sourceBranch);
    const target = this.getBranch(targetBranch);

    if (!source || !target) {
      throw new Error('Branch not found');
    }

    // Create merge commit
    const commit = this.commit(
      targetBranch,
      message || `Merge branch '${sourceBranch}' into ${targetBranch}`,
      author,
      { type: 'merge', parentIds: [target.headCommitId, source.headCommitId] }
    );

    // Update source branch
    source.status = 'merged';
    source.mergedAt = new Date();
    source.mergedInto = target.id;

    return commit;
  }

  deleteBranch(nameOrId: string): boolean {
    const index = this.tree.branches.findIndex(b => b.id === nameOrId || b.name === nameOrId);
    if (index === -1) return false;

    const branch = this.tree.branches[index];
    if (branch.isProtected) {
      throw new Error('Cannot delete protected branch');
    }
    if (branch.isDefault) {
      throw new Error('Cannot delete default branch');
    }

    this.tree.branches.splice(index, 1);
    this.tree.updatedAt = new Date();
    return true;
  }

  // ==========================================================================
  // Commit Operations
  // ==========================================================================

  commit(
    branchName: string,
    message: string,
    author: Author,
    options?: {
      description?: string;
      type?: CommitType;
      parentIds?: string[];
      contentHash?: string;
      metadata?: Record<string, unknown>;
    }
  ): Commit {
    const branch = this.getBranch(branchName);
    if (!branch) {
      throw new Error(`Branch not found: ${branchName}`);
    }

    const hash = this.generateHash();
    const parentIds = options?.parentIds || (branch.headCommitId ? [branch.headCommitId] : []);

    const commit: Commit = {
      id: this.generateId('commit'),
      hash,
      shortHash: hash.substring(0, 7),
      message,
      description: options?.description,
      author,
      timestamp: new Date(),
      parentIds,
      branchId: branch.id,
      type: options?.type || (parentIds.length === 0 ? 'initial' : 'update'),
      tags: [],
      contentHash: options?.contentHash,
      metadata: options?.metadata,
    };

    this.tree.commits.push(commit);
    branch.headCommitId = commit.id;
    this.tree.updatedAt = new Date();

    return commit;
  }

  getCommit(idOrHash: string): Commit | undefined {
    return this.tree.commits.find(
      c => c.id === idOrHash || c.hash === idOrHash || c.shortHash === idOrHash
    );
  }

  getCommitHistory(branchName: string, limit?: number): Commit[] {
    const branch = this.getBranch(branchName);
    if (!branch) return [];

    const history: Commit[] = [];
    const visited = new Set<string>();
    const queue = [branch.headCommitId];

    while (queue.length > 0 && (!limit || history.length < limit)) {
      const commitId = queue.shift()!;
      if (visited.has(commitId)) continue;
      visited.add(commitId);

      const commit = this.tree.commits.find(c => c.id === commitId);
      if (commit) {
        history.push(commit);
        queue.push(...commit.parentIds);
      }
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // ==========================================================================
  // Tag Operations
  // ==========================================================================

  createTag(
    name: string,
    commitId: string,
    author: Author,
    options?: { message?: string; isRelease?: boolean; releaseNotes?: string }
  ): Tag {
    const commit = this.getCommit(commitId);
    if (!commit) {
      throw new Error(`Commit not found: ${commitId}`);
    }

    const tag: Tag = {
      id: this.generateId('tag'),
      name,
      commitId: commit.id,
      message: options?.message,
      createdAt: new Date(),
      createdBy: author,
      isRelease: options?.isRelease || false,
      releaseNotes: options?.releaseNotes,
    };

    this.tree.tags.push(tag);
    commit.tags.push(name);
    this.tree.updatedAt = new Date();

    return tag;
  }

  getTag(name: string): Tag | undefined {
    return this.tree.tags.find(t => t.name === name);
  }

  // ==========================================================================
  // Tree Operations
  // ==========================================================================

  getTree(): VersionTree {
    return { ...this.tree };
  }

  getVisualization(): TreeNode[] {
    const nodes: TreeNode[] = [];
    const branchColumns = new Map<string, number>();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Assign columns to branches
    this.tree.branches.forEach((branch, i) => {
      branchColumns.set(branch.id, i);
    });

    // Sort commits by timestamp
    const sortedCommits = [...this.tree.commits].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Create nodes
    sortedCommits.forEach((commit, row) => {
      const column = branchColumns.get(commit.branchId) || 0;
      const color = colors[column % colors.length];

      const connections: TreeConnection[] = commit.parentIds.map(parentId => {
        const parent = this.tree.commits.find(c => c.id === parentId);
        const parentColumn = parent ? branchColumns.get(parent.branchId) || 0 : column;

        return {
          fromId: commit.id,
          toId: parentId,
          type: commit.type === 'merge' && parentColumn !== column ? 'merge' : 'parent',
          color,
          path: '',
        };
      });

      nodes.push({
        commit,
        x: column * 30,
        y: row * 50,
        column,
        row,
        color,
        connections,
      });
    });

    return nodes;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createVersionTree(name: string, description?: string): VersionTreeManager {
  return new VersionTreeManager(name, description);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatCommitDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function shortenHash(hash: string, length: number = 7): string {
  return hash.substring(0, length);
}

export function parseCommitMessage(message: string): { subject: string; body?: string } {
  const [subject, ...bodyLines] = message.split('\n');
  const body = bodyLines.join('\n').trim();
  return { subject, body: body || undefined };
}
