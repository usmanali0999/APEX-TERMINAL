import { create } from "zustand";
import { LogEntry, LogLevel, WorkspaceView } from "@/domain/models/types";

interface WorkspaceState {
  activeView: WorkspaceView;
  isCommandPaletteOpen: boolean;
  logs: LogEntry[];
  setActiveView: (view: WorkspaceView) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addLog: (level: LogLevel, message: string) => void;
  clearLogs: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeView: "TRADING",
  isCommandPaletteOpen: false,
  logs: [
    {
      id: "log-1",
      timestamp: Date.now() - 1000 * 60 * 15,
      level: "INFO",
      message: "Terminal boot completed.",
    },
    {
      id: "log-2",
      timestamp: Date.now() - 1000 * 60 * 10,
      level: "INFO",
      message: "Market data simulation engine initialized.",
    },
    {
      id: "log-3",
      timestamp: Date.now() - 1000 * 60 * 5,
      level: "TRADE",
      message: "Execution blotter is online and ready.",
    },
  ],

  setActiveView: (view) => {
    set({ activeView: view });
    const label = view.replace("_", " ");
    get().addLog("INFO", `Workspace switched to ${label}.`);
  },

  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  addLog: (level, message) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      level,
      message,
    };

    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 200),
    }));
  },

  clearLogs: () => set({ logs: [] }),
}));