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
  DesktopEnvironment: () => DesktopEnvironment,
  ProcessManager: () => ProcessManager,
  VirtualFileSystem: () => VirtualFileSystem,
  WindowManager: () => WindowManager,
  createDesktopEnvironment: () => createDesktopEnvironment,
  createFileSystem: () => createFileSystem,
  createProcessManager: () => createProcessManager,
  createWindowManager: () => createWindowManager
});
module.exports = __toCommonJS(index_exports);
var WindowManager = class {
  constructor() {
    this.windows = /* @__PURE__ */ new Map();
    this.zIndexCounter = 100;
    this.listeners = /* @__PURE__ */ new Map();
  }
  // ==========================================================================
  // Window Operations
  // ==========================================================================
  createWindow(config) {
    const id = this.generateId();
    const screen = { width: 1920, height: 1080 };
    let x = config.x ?? 50;
    let y = config.y ?? 50;
    if (config.centered) {
      x = (screen.width - (config.width || 800)) / 2;
      y = (screen.height - (config.height || 600)) / 2;
    }
    const window = {
      id,
      title: config.title,
      icon: config.icon,
      x,
      y,
      width: config.width || 800,
      height: config.height || 600,
      minWidth: config.minWidth || 200,
      minHeight: config.minHeight || 100,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      isResizable: config.isResizable !== false,
      isDraggable: config.isDraggable !== false,
      zIndex: ++this.zIndexCounter,
      appId: config.appId,
      metadata: config.metadata
    };
    for (const w of this.windows.values()) {
      w.isFocused = false;
    }
    this.windows.set(id, window);
    this.emit("window:created", window);
    return window;
  }
  closeWindow(id) {
    const window = this.windows.get(id);
    if (!window) return false;
    this.windows.delete(id);
    this.emit("window:closed", window);
    return true;
  }
  focusWindow(id) {
    const window = this.windows.get(id);
    if (!window) return;
    for (const w of this.windows.values()) {
      w.isFocused = false;
    }
    window.isFocused = true;
    window.isMinimized = false;
    window.zIndex = ++this.zIndexCounter;
    this.emit("window:focused", window);
  }
  minimizeWindow(id) {
    const window = this.windows.get(id);
    if (!window) return;
    window.isMinimized = true;
    window.isFocused = false;
    this.emit("window:minimized", window);
  }
  maximizeWindow(id) {
    const window = this.windows.get(id);
    if (!window) return;
    window.isMaximized = !window.isMaximized;
    this.emit("window:maximized", window);
  }
  moveWindow(id, x, y) {
    const window = this.windows.get(id);
    if (!window || !window.isDraggable) return;
    window.x = x;
    window.y = y;
    this.emit("window:moved", window);
  }
  resizeWindow(id, width, height) {
    const window = this.windows.get(id);
    if (!window || !window.isResizable) return;
    window.width = Math.max(window.minWidth || 0, Math.min(width, window.maxWidth || Infinity));
    window.height = Math.max(window.minHeight || 0, Math.min(height, window.maxHeight || Infinity));
    this.emit("window:resized", window);
  }
  // ==========================================================================
  // Queries
  // ==========================================================================
  getWindow(id) {
    return this.windows.get(id);
  }
  getAllWindows() {
    return Array.from(this.windows.values());
  }
  getWindowsByApp(appId) {
    return this.getAllWindows().filter((w) => w.appId === appId);
  }
  getFocusedWindow() {
    return this.getAllWindows().find((w) => w.isFocused);
  }
  getVisibleWindows() {
    return this.getAllWindows().filter((w) => !w.isMinimized).sort((a, b) => a.zIndex - b.zIndex);
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
  }
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(data);
      }
    }
  }
  generateId() {
    return `win_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
};
var VirtualFileSystem = class {
  constructor() {
    this.root = this.createDirectory("/", "/");
    this.initializeDefaultStructure();
  }
  initializeDefaultStructure() {
    this.mkdir("/home");
    this.mkdir("/home/user");
    this.mkdir("/home/user/Desktop");
    this.mkdir("/home/user/Documents");
    this.mkdir("/home/user/Downloads");
    this.mkdir("/home/user/Pictures");
    this.mkdir("/Applications");
    this.mkdir("/System");
    this.mkdir("/tmp");
  }
  createDirectory(name, path) {
    return {
      name,
      path,
      type: "directory",
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      permissions: { read: true, write: true, execute: true },
      owner: "root",
      children: /* @__PURE__ */ new Map()
    };
  }
  createFile(name, path, content = "") {
    const size = typeof content === "string" ? content.length : content.length;
    return {
      name,
      path,
      type: "file",
      size,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      permissions: { read: true, write: true, execute: false },
      owner: "user",
      content
    };
  }
  parsePath(path) {
    return path.split("/").filter(Boolean);
  }
  getNode(path) {
    if (path === "/") return this.root;
    const parts = this.parsePath(path);
    let current = this.root;
    for (const part of parts) {
      if (current.type !== "directory" || !current.children) {
        return null;
      }
      const child = current.children.get(part);
      if (!child) return null;
      current = child;
    }
    return current;
  }
  getParent(path) {
    const parts = this.parsePath(path);
    if (parts.length === 0) return null;
    const name = parts.pop();
    const parentPath = "/" + parts.join("/");
    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") return null;
    return { parent, name };
  }
  // ==========================================================================
  // File Operations
  // ==========================================================================
  exists(path) {
    return this.getNode(path) !== null;
  }
  isFile(path) {
    const node = this.getNode(path);
    return node?.type === "file";
  }
  isDirectory(path) {
    const node = this.getNode(path);
    return node?.type === "directory";
  }
  mkdir(path) {
    const result = this.getParent(path);
    if (!result) return false;
    const { parent, name } = result;
    if (parent.children.has(name)) return false;
    parent.children.set(name, this.createDirectory(name, path));
    return true;
  }
  writeFile(path, content) {
    const result = this.getParent(path);
    if (!result) return false;
    const { parent, name } = result;
    const existing = parent.children.get(name);
    if (existing && existing.type === "directory") return false;
    parent.children.set(name, this.createFile(name, path, content));
    return true;
  }
  readFile(path) {
    const node = this.getNode(path);
    if (!node || node.type !== "file") return null;
    return node.content || "";
  }
  readDir(path) {
    const node = this.getNode(path);
    if (!node || node.type !== "directory" || !node.children) return [];
    return Array.from(node.children.keys());
  }
  stat(path) {
    const node = this.getNode(path);
    if (!node) return null;
    const { content, children, ...stats } = node;
    return stats;
  }
  rm(path) {
    const result = this.getParent(path);
    if (!result) return false;
    const { parent, name } = result;
    return parent.children.delete(name);
  }
  mv(oldPath, newPath) {
    const node = this.getNode(oldPath);
    if (!node) return false;
    const newResult = this.getParent(newPath);
    if (!newResult) return false;
    const oldResult = this.getParent(oldPath);
    if (!oldResult) return false;
    oldResult.parent.children.delete(oldResult.name);
    node.name = newResult.name;
    node.path = newPath;
    newResult.parent.children.set(newResult.name, node);
    return true;
  }
  cp(srcPath, destPath) {
    const node = this.getNode(srcPath);
    if (!node || node.type !== "file") return false;
    return this.writeFile(destPath, node.content || "");
  }
  getSize(path) {
    const node = this.getNode(path);
    if (!node) return 0;
    if (node.type === "file") {
      return node.size;
    }
    let total = 0;
    const traverse = (n) => {
      if (n.type === "file") {
        total += n.size;
      } else if (n.children) {
        for (const child of n.children.values()) {
          traverse(child);
        }
      }
    };
    traverse(node);
    return total;
  }
};
var ProcessManager = class {
  constructor() {
    this.processes = /* @__PURE__ */ new Map();
    this.pidCounter = 1e3;
    this.listeners = /* @__PURE__ */ new Map();
  }
  spawn(appId, windowId) {
    const pid = ++this.pidCounter;
    const process = {
      pid,
      appId,
      windowId,
      status: "running",
      startedAt: Date.now(),
      cpuUsage: 0,
      memoryUsage: 0
    };
    this.processes.set(pid, process);
    this.emit("process:started", process);
    return process;
  }
  terminate(pid) {
    const process = this.processes.get(pid);
    if (!process) return false;
    process.status = "terminated";
    this.processes.delete(pid);
    this.emit("process:terminated", process);
    return true;
  }
  suspend(pid) {
    const process = this.processes.get(pid);
    if (!process || process.status !== "running") return false;
    process.status = "suspended";
    return true;
  }
  resume(pid) {
    const process = this.processes.get(pid);
    if (!process || process.status !== "suspended") return false;
    process.status = "running";
    return true;
  }
  getProcess(pid) {
    return this.processes.get(pid);
  }
  getAllProcesses() {
    return Array.from(this.processes.values());
  }
  getProcessesByApp(appId) {
    return this.getAllProcesses().filter((p) => p.appId === appId);
  }
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
  }
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(data);
      }
    }
  }
};
var DesktopEnvironment = class {
  constructor() {
    this.apps = /* @__PURE__ */ new Map();
    this.notifications = [];
    this.windows = new WindowManager();
    this.fs = new VirtualFileSystem();
    this.processes = new ProcessManager();
    this.settings = {
      theme: "dark",
      iconSize: "medium",
      taskbarPosition: "bottom",
      showDesktopIcons: true,
      animations: true
    };
  }
  // ==========================================================================
  // Application Management
  // ==========================================================================
  registerApp(app) {
    this.apps.set(app.id, app);
  }
  unregisterApp(appId) {
    this.apps.delete(appId);
  }
  getApp(appId) {
    return this.apps.get(appId);
  }
  getAllApps() {
    return Array.from(this.apps.values());
  }
  launchApp(appId, params) {
    const app = this.apps.get(appId);
    if (!app) return null;
    if (app.singleton) {
      const existingWindow = this.windows.getWindowsByApp(appId)[0];
      if (existingWindow) {
        this.windows.focusWindow(existingWindow.id);
        return {
          window: existingWindow,
          process: this.processes.getProcessesByApp(appId)[0]
        };
      }
    }
    const window = this.windows.createWindow({
      title: app.name,
      icon: app.icon,
      appId,
      ...app.defaultWindow,
      metadata: params
    });
    const process = this.processes.spawn(appId, window.id);
    return { window, process };
  }
  // ==========================================================================
  // Notifications
  // ==========================================================================
  notify(title, message, options) {
    const notification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      ...options
    };
    this.notifications.unshift(notification);
    return notification;
  }
  getNotifications() {
    return [...this.notifications];
  }
  markNotificationRead(id) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }
  clearNotifications() {
    this.notifications = [];
  }
  // ==========================================================================
  // Settings
  // ==========================================================================
  getSettings() {
    return { ...this.settings };
  }
  updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
  }
};
function createDesktopEnvironment() {
  return new DesktopEnvironment();
}
function createWindowManager() {
  return new WindowManager();
}
function createFileSystem() {
  return new VirtualFileSystem();
}
function createProcessManager() {
  return new ProcessManager();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DesktopEnvironment,
  ProcessManager,
  VirtualFileSystem,
  WindowManager,
  createDesktopEnvironment,
  createFileSystem,
  createProcessManager,
  createWindowManager
});
//# sourceMappingURL=index.cjs.map