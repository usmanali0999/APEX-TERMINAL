"use client";

import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { WorkspaceView } from "@/domain/models/types";

const tabs: { key: WorkspaceView; label: string }[] = [
  { key: "TRADING", label: "Trading" },
  { key: "ALGO_STUDIO", label: "Algo Studio" },
  { key: "RISK_DASHBOARD", label: "Risk" },
  { key: "SYSTEM_LOGS", label: "System Logs" },
];

export function WorkspaceTabs() {
  const activeView = useWorkspaceStore((state) => state.activeView);
  const setActiveView = useWorkspaceStore((state) => state.setActiveView);

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = activeView === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-mono border transition-all ${
              active
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/50"
                : "bg-gray-950 text-gray-400 border-gray-900 hover:border-gray-700 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}