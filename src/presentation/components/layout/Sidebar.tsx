"use client";

import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { WorkspaceView } from "@/domain/models/types";

const items: { key: WorkspaceView; label: string; icon: string }[] = [
  { key: "TRADING", label: "Trading", icon: "📈" },
  { key: "ALGO_STUDIO", label: "Algo Studio", icon: "🤖" },
  { key: "RISK_DASHBOARD", label: "Risk", icon: "🛡️" },
  { key: "SYSTEM_LOGS", label: "Logs", icon: "💻" },
];

export function Sidebar() {
  const activeView = useWorkspaceStore((s) => s.activeView);
  const setActiveView = useWorkspaceStore((s) => s.setActiveView);
  const toggleCommandPalette = useWorkspaceStore(
    (s) => s.toggleCommandPalette
  );

  return (
    <aside className="hidden lg:flex w-16 flex-col items-center gap-2 border-r border-gray-900 bg-black/95 py-4">
      <button
        onClick={toggleCommandPalette}
        className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/20 transition-all"
        title="Command Palette (Ctrl+K)"
      >
        ⌘
      </button>

      <div className="w-8 h-px bg-gray-900 my-2" />

      {items.map((item) => {
        const active = activeView === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all text-lg ${
              active
                ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-300"
                : "text-gray-500 hover:bg-gray-900 hover:text-white"
            }`}
            title={item.label}
          >
            {item.icon}
          </button>
        );
      })}
    </aside>
  );
}