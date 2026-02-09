// src/index.ts
var VersionTreeManager = class {
  constructor(name, description) {
    const now = /* @__PURE__ */ new Date();
    this.tree = {
      id: this.generateId("tree"),
      name,
      description,
      branches: [],
      commits: [],
      tags: [],
      defaultBranch: "main",
      createdAt: now,
      updatedAt: now
    };
    this.createBranch("main", void 0, { isDefault: true });
  }
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateHash() {
    const chars = "0123456789abcdef";
    let hash = "";
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
  // ==========================================================================
  // Branch Operations
  // ==========================================================================
  createBranch(name, fromCommitId, options) {
    const author = options?.author || { id: "system", name: "System" };
    const baseCommitId = fromCommitId || this.tree.commits[this.tree.commits.length - 1]?.id || "";
    const branch = {
      id: this.generateId("branch"),
      name,
      status: "active",
      headCommitId: baseCommitId,
      baseCommitId,
      createdAt: /* @__PURE__ */ new Date(),
      createdBy: author,
      isDefault: options?.isDefault || false,
      isProtected: options?.isProtected || false
    };
    this.tree.branches.push(branch);
    if (options?.isDefault) {
      this.tree.defaultBranch = name;
    }
    this.tree.updatedAt = /* @__PURE__ */ new Date();
    return branch;
  }
  getBranch(nameOrId) {
    return this.tree.branches.find((b) => b.id === nameOrId || b.name === nameOrId);
  }
  mergeBranch(sourceBranch, targetBranch, author, message) {
    const source = this.getBranch(sourceBranch);
    const target = this.getBranch(targetBranch);
    if (!source || !target) {
      throw new Error("Branch not found");
    }
    const commit = this.commit(
      targetBranch,
      message || `Merge branch '${sourceBranch}' into ${targetBranch}`,
      author,
      { type: "merge", parentIds: [target.headCommitId, source.headCommitId] }
    );
    source.status = "merged";
    source.mergedAt = /* @__PURE__ */ new Date();
    source.mergedInto = target.id;
    return commit;
  }
  deleteBranch(nameOrId) {
    const index = this.tree.branches.findIndex((b) => b.id === nameOrId || b.name === nameOrId);
    if (index === -1) return false;
    const branch = this.tree.branches[index];
    if (branch.isProtected) {
      throw new Error("Cannot delete protected branch");
    }
    if (branch.isDefault) {
      throw new Error("Cannot delete default branch");
    }
    this.tree.branches.splice(index, 1);
    this.tree.updatedAt = /* @__PURE__ */ new Date();
    return true;
  }
  // ==========================================================================
  // Commit Operations
  // ==========================================================================
  commit(branchName, message, author, options) {
    const branch = this.getBranch(branchName);
    if (!branch) {
      throw new Error(`Branch not found: ${branchName}`);
    }
    const hash = this.generateHash();
    const parentIds = options?.parentIds || (branch.headCommitId ? [branch.headCommitId] : []);
    const commit = {
      id: this.generateId("commit"),
      hash,
      shortHash: hash.substring(0, 7),
      message,
      description: options?.description,
      author,
      timestamp: /* @__PURE__ */ new Date(),
      parentIds,
      branchId: branch.id,
      type: options?.type || (parentIds.length === 0 ? "initial" : "update"),
      tags: [],
      contentHash: options?.contentHash,
      metadata: options?.metadata
    };
    this.tree.commits.push(commit);
    branch.headCommitId = commit.id;
    this.tree.updatedAt = /* @__PURE__ */ new Date();
    return commit;
  }
  getCommit(idOrHash) {
    return this.tree.commits.find(
      (c) => c.id === idOrHash || c.hash === idOrHash || c.shortHash === idOrHash
    );
  }
  getCommitHistory(branchName, limit) {
    const branch = this.getBranch(branchName);
    if (!branch) return [];
    const history = [];
    const visited = /* @__PURE__ */ new Set();
    const queue = [branch.headCommitId];
    while (queue.length > 0 && (!limit || history.length < limit)) {
      const commitId = queue.shift();
      if (visited.has(commitId)) continue;
      visited.add(commitId);
      const commit = this.tree.commits.find((c) => c.id === commitId);
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
  createTag(name, commitId, author, options) {
    const commit = this.getCommit(commitId);
    if (!commit) {
      throw new Error(`Commit not found: ${commitId}`);
    }
    const tag = {
      id: this.generateId("tag"),
      name,
      commitId: commit.id,
      message: options?.message,
      createdAt: /* @__PURE__ */ new Date(),
      createdBy: author,
      isRelease: options?.isRelease || false,
      releaseNotes: options?.releaseNotes
    };
    this.tree.tags.push(tag);
    commit.tags.push(name);
    this.tree.updatedAt = /* @__PURE__ */ new Date();
    return tag;
  }
  getTag(name) {
    return this.tree.tags.find((t) => t.name === name);
  }
  // ==========================================================================
  // Tree Operations
  // ==========================================================================
  getTree() {
    return { ...this.tree };
  }
  getVisualization() {
    const nodes = [];
    const branchColumns = /* @__PURE__ */ new Map();
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    this.tree.branches.forEach((branch, i) => {
      branchColumns.set(branch.id, i);
    });
    const sortedCommits = [...this.tree.commits].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    sortedCommits.forEach((commit, row) => {
      const column = branchColumns.get(commit.branchId) || 0;
      const color = colors[column % colors.length];
      const connections = commit.parentIds.map((parentId) => {
        const parent = this.tree.commits.find((c) => c.id === parentId);
        const parentColumn = parent ? branchColumns.get(parent.branchId) || 0 : column;
        return {
          fromId: commit.id,
          toId: parentId,
          type: commit.type === "merge" && parentColumn !== column ? "merge" : "parent",
          color,
          path: ""
        };
      });
      nodes.push({
        commit,
        x: column * 30,
        y: row * 50,
        column,
        row,
        color,
        connections
      });
    });
    return nodes;
  }
};
function createVersionTree(name, description) {
  return new VersionTreeManager(name, description);
}
function formatCommitDate(date) {
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
function shortenHash(hash, length = 7) {
  return hash.substring(0, length);
}
function parseCommitMessage(message) {
  const [subject, ...bodyLines] = message.split("\n");
  const body = bodyLines.join("\n").trim();
  return { subject, body: body || void 0 };
}
export {
  VersionTreeManager,
  createVersionTree,
  formatCommitDate,
  parseCommitMessage,
  shortenHash
};
//# sourceMappingURL=index.js.map