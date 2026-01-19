/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

// Electron API 타입 정의
interface Shortcuts {
  toggleTimer: string;
  showWindow: string;
}

interface ElectronAPI {
  setTimerEnabled: (enabled: boolean) => void;
  onToggleTimer: (callback: () => void) => void;
  getShortcuts: () => Promise<Shortcuts>;
  setShortcuts: (shortcuts: Shortcuts) => Promise<{ success: boolean }>;
  validateShortcut: (shortcut: string) => Promise<{ valid: boolean; error?: string }>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
