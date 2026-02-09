/**
 * @b0ase/os-shell
 *
 * Desktop OS simulation with window management, filesystem, and processes.
 *
 * @packageDocumentation
 */
/** Window state */
interface WindowState {
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
interface WindowConfig {
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
interface Application {
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
interface Process {
    pid: number;
    appId: string;
    windowId?: string;
    status: 'running' | 'suspended' | 'terminated';
    startedAt: number;
    cpuUsage: number;
    memoryUsage: number;
}
/** File node */
interface FileNode {
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
    target?: string;
    metadata?: Record<string, unknown>;
}
/** File permissions */
interface FilePermissions {
    read: boolean;
    write: boolean;
    execute: boolean;
}
/** Desktop settings */
interface DesktopSettings {
    wallpaper?: string;
    theme: 'light' | 'dark' | 'system';
    iconSize: 'small' | 'medium' | 'large';
    taskbarPosition: 'top' | 'bottom' | 'left' | 'right';
    showDesktopIcons: boolean;
    animations: boolean;
}
/** Notification */
interface Notification {
    id: string;
    title: string;
    message: string;
    icon?: string;
    appId?: string;
    timestamp: number;
    read: boolean;
    actions?: Array<{
        label: string;
        action: string;
    }>;
}
/** Desktop event */
type DesktopEvent = 'window:created' | 'window:closed' | 'window:focused' | 'window:moved' | 'window:resized' | 'window:minimized' | 'window:maximized' | 'process:started' | 'process:terminated' | 'notification:created' | 'settings:changed';
/** Event listener */
type DesktopEventListener = (data: unknown) => void;
declare class WindowManager {
    private windows;
    private zIndexCounter;
    private listeners;
    createWindow(config: WindowConfig): WindowState;
    closeWindow(id: string): boolean;
    focusWindow(id: string): void;
    minimizeWindow(id: string): void;
    maximizeWindow(id: string): void;
    moveWindow(id: string, x: number, y: number): void;
    resizeWindow(id: string, width: number, height: number): void;
    getWindow(id: string): WindowState | undefined;
    getAllWindows(): WindowState[];
    getWindowsByApp(appId: string): WindowState[];
    getFocusedWindow(): WindowState | undefined;
    getVisibleWindows(): WindowState[];
    on(event: string, listener: DesktopEventListener): () => void;
    off(event: string, listener: DesktopEventListener): void;
    private emit;
    private generateId;
}
declare class VirtualFileSystem {
    private root;
    constructor();
    private initializeDefaultStructure;
    private createDirectory;
    private createFile;
    private parsePath;
    private getNode;
    private getParent;
    exists(path: string): boolean;
    isFile(path: string): boolean;
    isDirectory(path: string): boolean;
    mkdir(path: string): boolean;
    writeFile(path: string, content: string | Uint8Array): boolean;
    readFile(path: string): string | Uint8Array | null;
    readDir(path: string): string[];
    stat(path: string): Omit<FileNode, 'content' | 'children'> | null;
    rm(path: string): boolean;
    mv(oldPath: string, newPath: string): boolean;
    cp(srcPath: string, destPath: string): boolean;
    getSize(path: string): number;
}
declare class ProcessManager {
    private processes;
    private pidCounter;
    private listeners;
    spawn(appId: string, windowId?: string): Process;
    terminate(pid: number): boolean;
    suspend(pid: number): boolean;
    resume(pid: number): boolean;
    getProcess(pid: number): Process | undefined;
    getAllProcesses(): Process[];
    getProcessesByApp(appId: string): Process[];
    on(event: string, listener: DesktopEventListener): () => void;
    off(event: string, listener: DesktopEventListener): void;
    private emit;
}
declare class DesktopEnvironment {
    readonly windows: WindowManager;
    readonly fs: VirtualFileSystem;
    readonly processes: ProcessManager;
    private apps;
    private notifications;
    private settings;
    constructor();
    registerApp(app: Application): void;
    unregisterApp(appId: string): void;
    getApp(appId: string): Application | undefined;
    getAllApps(): Application[];
    launchApp(appId: string, params?: Record<string, unknown>): {
        window: WindowState;
        process: Process;
    } | null;
    notify(title: string, message: string, options?: Partial<Notification>): Notification;
    getNotifications(): Notification[];
    markNotificationRead(id: string): void;
    clearNotifications(): void;
    getSettings(): DesktopSettings;
    updateSettings(updates: Partial<DesktopSettings>): void;
}
declare function createDesktopEnvironment(): DesktopEnvironment;
declare function createWindowManager(): WindowManager;
declare function createFileSystem(): VirtualFileSystem;
declare function createProcessManager(): ProcessManager;

export { type Application, DesktopEnvironment, type DesktopEvent, type DesktopEventListener, type DesktopSettings, type FileNode, type FilePermissions, type Notification, type Process, ProcessManager, VirtualFileSystem, type WindowConfig, WindowManager, type WindowState, createDesktopEnvironment, createFileSystem, createProcessManager, createWindowManager };
