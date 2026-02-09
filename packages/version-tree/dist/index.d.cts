/**
 * @b0ase/version-tree
 *
 * Git-like version tree visualization and management.
 *
 * @packageDocumentation
 */
/** Commit type */
type CommitType = 'initial' | 'update' | 'merge' | 'revert' | 'tag';
/** Branch status */
type BranchStatus = 'active' | 'merged' | 'abandoned' | 'protected';
/** Commit node */
interface Commit {
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
interface Author {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
}
/** Branch */
interface Branch {
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
interface Tag {
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
interface VersionTree {
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
interface TreeNode {
    commit: Commit;
    x: number;
    y: number;
    column: number;
    row: number;
    color: string;
    connections: TreeConnection[];
}
/** Tree connection */
interface TreeConnection {
    fromId: string;
    toId: string;
    type: 'parent' | 'merge';
    color: string;
    path: string;
}
/** Diff */
interface Diff {
    fromCommitId: string;
    toCommitId: string;
    additions: number;
    deletions: number;
    changes: DiffChange[];
}
/** Diff change */
interface DiffChange {
    path: string;
    type: 'added' | 'modified' | 'deleted' | 'renamed';
    oldPath?: string;
    additions: number;
    deletions: number;
}
declare class VersionTreeManager {
    private tree;
    constructor(name: string, description?: string);
    private generateId;
    private generateHash;
    createBranch(name: string, fromCommitId?: string, options?: {
        isDefault?: boolean;
        isProtected?: boolean;
        author?: Author;
    }): Branch;
    getBranch(nameOrId: string): Branch | undefined;
    mergeBranch(sourceBranch: string, targetBranch: string, author: Author, message?: string): Commit;
    deleteBranch(nameOrId: string): boolean;
    commit(branchName: string, message: string, author: Author, options?: {
        description?: string;
        type?: CommitType;
        parentIds?: string[];
        contentHash?: string;
        metadata?: Record<string, unknown>;
    }): Commit;
    getCommit(idOrHash: string): Commit | undefined;
    getCommitHistory(branchName: string, limit?: number): Commit[];
    createTag(name: string, commitId: string, author: Author, options?: {
        message?: string;
        isRelease?: boolean;
        releaseNotes?: string;
    }): Tag;
    getTag(name: string): Tag | undefined;
    getTree(): VersionTree;
    getVisualization(): TreeNode[];
}
declare function createVersionTree(name: string, description?: string): VersionTreeManager;
declare function formatCommitDate(date: Date): string;
declare function shortenHash(hash: string, length?: number): string;
declare function parseCommitMessage(message: string): {
    subject: string;
    body?: string;
};

export { type Author, type Branch, type BranchStatus, type Commit, type CommitType, type Diff, type DiffChange, type Tag, type TreeConnection, type TreeNode, type VersionTree, VersionTreeManager, createVersionTree, formatCommitDate, parseCommitMessage, shortenHash };
