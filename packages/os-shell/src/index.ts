/**
 * @b0ase/os-shell
 *
 * Desktop OS simulation with window management, filesystem, and processes.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Window state */
export interface WindowState {
  id: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  zIndex: number;
  appId: string;
  metadata?: Record<string, unknown>;
}

/** Window config */
export interface WindowConfig {
  title: string;
  icon?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  isResizable?: boolean;
  isDraggable?: boolean;
  centered?: boolean;
  appId: string;
  metadata?: Record<string, unknown>;
}

/** Application definition */
export interface Application {
  id: string;
  name: string;
  icon: string;
  description?: string;
  version?: string;
  category?: string;
  defaultWindow?: Partial<WindowConfig>;
  singleton?: boolean;
  permissions?: string[];
}

/** Process state */
export interface Process {
  pid: number;
  appId: string;
  windowId?: string;
  status: 'running' | 'suspended' | 'terminated';
  startedAt: number;
  cpuUsage: number;
  memoryUsage: number;
}

/** File node */
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  createdAt: number;
  modifiedAt: number;
  permissions: FilePermissions;
  owner: string;
  content?: string | Uint8Array;
  children?: Map<string, FileNode>;
  target?: string; // For symlinks
  metadata?: Record<string, unknown>;
}

/** File permissions */
export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
}

/** Desktop settings */
export interface DesktopSettings {
  wallpaper?: string;
  theme: 'light' | 'dark' | 'system';
  iconSize: 'small' | 'medium' | 'large';
  taskbarPosition: 'top' | 'bottom' | 'left' | 'right';
  showDesktopIcons: boolean;
  animations: boolean;
}

/** Notification */
export interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  appId?: string;
  timestamp: number;
  read: boolean;
  actions?: Array<{ label: string; action: string }>;
}

/** Desktop event */
export type DesktopEvent =
  | 'window:created'
  | 'window:closed'
  | 'window:focused'
  | 'window:moved'
  | 'window:resized'
  | 'window:minimized'
  | 'window:maximized'
  | 'process:started'
  | 'process:terminated'
  | 'notification:created'
  | 'settings:changed';

/** Event listener */
export type DesktopEventListener = (data: unknown) => void;

// ============================================================================
// Window Manager
// ============================================================================

export class WindowManager {
  private windows: Map<string, WindowState> = new Map();
  private zIndexCounter = 100;
  private listeners: Map<string, Set<DesktopEventListener>> = new Map();

  // ==========================================================================
  // Window Operations
  // ==========================================================================

  createWindow(config: WindowConfig): WindowState {
    const id = this.generateId();
    const screen = { width: 1920, height: 1080 }; // Default screen size

    let x = config.x ?? 50;
    let y = config.y ?? 50;

    if (config.centered) {
      x = (screen.width - (config.width || 800)) / 2;
      y = (screen.height - (config.height || 600)) / 2;
    }

    const window: WindowState = {
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
      metadata: config.metadata,
    };

    // Unfocus other windows
    for (const w of this.windows.values()) {
      w.isFocused = false;
    }

    this.windows.set(id, window);
    this.emit('window:created', window);
    return window;
  }

  closeWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (!window) return false;

    this.windows.delete(id);
    this.emit('window:closed', window);
    return true;
  }

  focusWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    for (const w of this.windows.values()) {
      w.isFocused = false;
    }

    window.isFocused = true;
    window.isMinimized = false;
    window.zIndex = ++this.zIndexCounter;
    this.emit('window:focused', window);
  }

  minimizeWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    window.isMinimized = true;
    window.isFocused = false;
    this.emit('window:minimized', window);
  }

  maximizeWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    window.isMaximized = !window.isMaximized;
    this.emit('window:maximized', window);
  }

  moveWindow(id: string, x: number, y: number): void {
    const window = this.windows.get(id);
    if (!window || !window.isDraggable) return;

    window.x = x;
    window.y = y;
    this.emit('window:moved', window);
  }

  resizeWindow(id: string, width: number, height: number): void {
    const window = this.windows.get(id);
    if (!window || !window.isResizable) return;

    window.width = Math.max(window.minWidth || 0, Math.min(width, window.maxWidth || Infinity));
    window.height = Math.max(window.minHeight || 0, Math.min(height, window.maxHeight || Infinity));
    this.emit('window:resized', window);
  }

  // ==========================================================================
  // Queries
  // ==========================================================================

  getWindow(id: string): WindowState | undefined {
    return this.windows.get(id);
  }

  getAllWindows(): WindowState[] {
    return Array.from(this.windows.values());
  }

  getWindowsByApp(appId: string): WindowState[] {
    return this.getAllWindows().filter((w) => w.appId === appId);
  }

  getFocusedWindow(): WindowState | undefined {
    return this.getAllWindows().find((w) => w.isFocused);
  }

  getVisibleWindows(): WindowState[] {
    return this.getAllWindows()
      .filter((w) => !w.isMinimized)
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(event: string, listener: DesktopEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: DesktopEventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(data);
      }
    }
  }

  private generateId(): string {
    return `win_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

// ============================================================================
// Virtual Filesystem
// ============================================================================

export class VirtualFileSystem {
  private root: FileNode;

  constructor() {
    this.root = this.createDirectory('/', '/');
    this.initializeDefaultStructure();
  }

  private initializeDefaultStructure(): void {
    this.mkdir('/home');
    this.mkdir('/home/user');
    this.mkdir('/home/user/Desktop');
    this.mkdir('/home/user/Documents');
    this.mkdir('/home/user/Downloads');
    this.mkdir('/home/user/Pictures');
    this.mkdir('/Applications');
    this.mkdir('/System');
    this.mkdir('/tmp');
  }

  private createDirectory(name: string, path: string): FileNode {
    return {
      name,
      path,
      type: 'directory',
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      permissions: { read: true, write: true, execute: true },
      owner: 'root',
      children: new Map(),
    };
  }

  private createFile(name: string, path: string, content: string | Uint8Array = ''): FileNode {
    const size = typeof content === 'string' ? content.length : content.length;
    return {
      name,
      path,
      type: 'file',
      size,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      permissions: { read: true, write: true, execute: false },
      owner: 'user',
      content,
    };
  }

  private parsePath(path: string): string[] {
    return path.split('/').filter(Boolean);
  }

  private getNode(path: string): FileNode | null {
    if (path === '/') return this.root;

    const parts = this.parsePath(path);
    let current = this.root;

    for (const part of parts) {
      if (current.type !== 'directory' || !current.children) {
        return null;
      }
      const child = current.children.get(part);
      if (!child) return null;
      current = child;
    }

    return current;
  }

  private getParent(path: string): { parent: FileNode; name: string } | null {
    const parts = this.parsePath(path);
    if (parts.length === 0) return null;

    const name = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parent = this.getNode(parentPath);

    if (!parent || parent.type !== 'directory') return null;
    return { parent, name };
  }

  // ==========================================================================
  // File Operations
  // ==========================================================================

  exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  isFile(path: string): boolean {
    const node = this.getNode(path);
    return node?.type === 'file';
  }

  isDirectory(path: string): boolean {
    const node = this.getNode(path);
    return node?.type === 'directory';
  }

  mkdir(path: string): boolean {
    const result = this.getParent(path);
    if (!result) return false;

    const { parent, name } = result;
    if (parent.children!.has(name)) return false;

    parent.children!.set(name, this.createDirectory(name, path));
    return true;
  }

  writeFile(path: string, content: string | Uint8Array): boolean {
    const result = this.getParent(path);
    if (!result) return false;

    const { parent, name } = result;
    const existing = parent.children!.get(name);

    if (existing && existing.type === 'directory') return false;

    parent.children!.set(name, this.createFile(name, path, content));
    return true;
  }

  readFile(path: string): string | Uint8Array | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content || '';
  }

  readDir(path: string): string[] {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory' || !node.children) return [];
    return Array.from(node.children.keys());
  }

  stat(path: string): Omit<FileNode, 'content' | 'children'> | null {
    const node = this.getNode(path);
    if (!node) return null;

    const { content, children, ...stats } = node;
    return stats;
  }

  rm(path: string): boolean {
    const result = this.getParent(path);
    if (!result) return false;

    const { parent, name } = result;
    return parent.children!.delete(name);
  }

  mv(oldPath: string, newPath: string): boolean {
    const node = this.getNode(oldPath);
    if (!node) return false;

    const newResult = this.getParent(newPath);
    if (!newResult) return false;

    const oldResult = this.getParent(oldPath);
    if (!oldResult) return false;

    oldResult.parent.children!.delete(oldResult.name);
    node.name = newResult.name;
    node.path = newPath;
    newResult.parent.children!.set(newResult.name, node);

    return true;
  }

  cp(srcPath: string, destPath: string): boolean {
    const node = this.getNode(srcPath);
    if (!node || node.type !== 'file') return false;

    return this.writeFile(destPath, node.content || '');
  }

  getSize(path: string): number {
    const node = this.getNode(path);
    if (!node) return 0;

    if (node.type === 'file') {
      return node.size;
    }

    let total = 0;
    const traverse = (n: FileNode): void => {
      if (n.type === 'file') {
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
}

// ============================================================================
// Process Manager
// ============================================================================

export class ProcessManager {
  private processes: Map<number, Process> = new Map();
  private pidCounter = 1000;
  private listeners: Map<string, Set<DesktopEventListener>> = new Map();

  spawn(appId: string, windowId?: string): Process {
    const pid = ++this.pidCounter;
    const process: Process = {
      pid,
      appId,
      windowId,
      status: 'running',
      startedAt: Date.now(),
      cpuUsage: 0,
      memoryUsage: 0,
    };

    this.processes.set(pid, process);
    this.emit('process:started', process);
    return process;
  }

  terminate(pid: number): boolean {
    const process = this.processes.get(pid);
    if (!process) return false;

    process.status = 'terminated';
    this.processes.delete(pid);
    this.emit('process:terminated', process);
    return true;
  }

  suspend(pid: number): boolean {
    const process = this.processes.get(pid);
    if (!process || process.status !== 'running') return false;

    process.status = 'suspended';
    return true;
  }

  resume(pid: number): boolean {
    const process = this.processes.get(pid);
    if (!process || process.status !== 'suspended') return false;

    process.status = 'running';
    return true;
  }

  getProcess(pid: number): Process | undefined {
    return this.processes.get(pid);
  }

  getAllProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  getProcessesByApp(appId: string): Process[] {
    return this.getAllProcesses().filter((p) => p.appId === appId);
  }

  on(event: string, listener: DesktopEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: DesktopEventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(data);
      }
    }
  }
}

// ============================================================================
// Desktop Environment
// ============================================================================

export class DesktopEnvironment {
  readonly windows: WindowManager;
  readonly fs: VirtualFileSystem;
  readonly processes: ProcessManager;
  private apps: Map<string, Application> = new Map();
  private notifications: Notification[] = [];
  private settings: DesktopSettings;

  constructor() {
    this.windows = new WindowManager();
    this.fs = new VirtualFileSystem();
    this.processes = new ProcessManager();
    this.settings = {
      theme: 'dark',
      iconSize: 'medium',
      taskbarPosition: 'bottom',
      showDesktopIcons: true,
      animations: true,
    };
  }

  // ==========================================================================
  // Application Management
  // ==========================================================================

  registerApp(app: Application): void {
    this.apps.set(app.id, app);
  }

  unregisterApp(appId: string): void {
    this.apps.delete(appId);
  }

  getApp(appId: string): Application | undefined {
    return this.apps.get(appId);
  }

  getAllApps(): Application[] {
    return Array.from(this.apps.values());
  }

  launchApp(appId: string, params?: Record<string, unknown>): { window: WindowState; process: Process } | null {
    const app = this.apps.get(appId);
    if (!app) return null;

    // Check singleton
    if (app.singleton) {
      const existingWindow = this.windows.getWindowsByApp(appId)[0];
      if (existingWindow) {
        this.windows.focusWindow(existingWindow.id);
        return {
          window: existingWindow,
          process: this.processes.getProcessesByApp(appId)[0],
        };
      }
    }

    const window = this.windows.createWindow({
      title: app.name,
      icon: app.icon,
      appId,
      ...app.defaultWindow,
      metadata: params,
    });

    const process = this.processes.spawn(appId, window.id);

    return { window, process };
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================

  notify(title: string, message: string, options?: Partial<Notification>): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      ...options,
    };

    this.notifications.unshift(notification);
    return notification;
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  markNotificationRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  // ==========================================================================
  // Settings
  // ==========================================================================

  getSettings(): DesktopSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<DesktopSettings>): void {
    this.settings = { ...this.settings, ...updates };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createDesktopEnvironment(): DesktopEnvironment {
  return new DesktopEnvironment();
}

export function createWindowManager(): WindowManager {
  return new WindowManager();
}

export function createFileSystem(): VirtualFileSystem {
  return new VirtualFileSystem();
}

export function createProcessManager(): ProcessManager {
  return new ProcessManager();
}
