"use client";

import { useEffect, useState } from "react";
import { useMarketStore } from "@/application/store/marketStore";
import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { WorkspaceView } from "@/domain/models/types";

const viewLabels: Record<WorkspaceView, string> = {
  TRADING: "Trading Desk",
  ALGO_STUDIO: "Algo Studio",
  RISK_DASHBOARD: "Risk Dashboard",
  SYSTEM_LOGS: "System Logs",
};

export function TerminalHeader() {
  const tick = useMarketStore((state) => state.tick);
  const activeView = useWorkspaceStore((state) => state.activeView);
  const toggleCommandPalette = useWorkspaceStore(
    (state) => state.toggleCommandPalette
  );
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-gray-900 bg-black/95 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-cyan-400 font-bold tracking-wider">
              APEXPULSE TERMINAL
            </span>
            <span className="text-[10px] px-2 py-1 rounded bg-gray-900 text-gray-400 border border-gray-800">
              LIVE SIM
            </span>
            <button
              onClick={toggleCommandPalette}
              className="hidden md:flex items-center gap-2 text-[10px] px-2 py-1 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="Open Command Palette"
            >
              <span>⌘</span>
              <span>Ctrl+K</span>
            </button>
          </div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            {viewLabels[activeView]} • Institutional React / Next Trading Workspace
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <div className="rounded-lg border border-gray-900 bg-gray-950 px-3 py-2">
            <div className="text-gray-500">Feed</div>
            <div className="text-green-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Streaming
            </div>
          </div>

          <div className="rounded-lg border border-gray-900 bg-gray-950 px-3 py-2">
            <div className="text-gray-500">Symbol</div>
            <div className="text-white">{tick?.symbol ?? "BTC/USD"}</div>
          </div>

          <div className="rounded-lg border border-gray-900 bg-gray-950 px-3 py-2">
            <div className="text-gray-500">Last Price</div>
            <div className="text-white">
              ${tick ? tick.price.toLocaleString() : "—"}
            </div>
          </div>

          <div className="rounded-lg border border-gray-900 bg-gray-950 px-3 py-2">
            <div className="text-gray-500">Local Time</div>
            <div className="text-white">
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}