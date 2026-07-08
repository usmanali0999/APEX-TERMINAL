"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketStore } from "@/application/store/marketStore";
import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { useAuthStore } from "@/application/store/authStore";
import { WorkspaceView } from "@/domain/models/types";

const viewLabels: Record<WorkspaceView, string> = {
  TRADING: "Trading Desk",
  ALGO_STUDIO: "Algo Studio",
  RISK_DASHBOARD: "Risk Dashboard",
  SYSTEM_LOGS: "System Logs",
};

export function TerminalHeader() {
  const router = useRouter();
  const tick = useMarketStore((state) => state.tick);
  const isLiveConnected = useMarketStore((state) => state.isLiveConnected);
  const activeView = useWorkspaceStore((state) => state.activeView);
  const toggleCommandPalette = useWorkspaceStore(
    (state) => state.toggleCommandPalette
  );
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const initialTimer = setTimeout(() => setTime(new Date()), 0);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-900 bg-black/95 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 font-mono flex-wrap">
            <span className="text-cyan-400 font-bold tracking-wider">
              APEXPULSE TERMINAL
            </span>
            <span
              className={`text-[10px] px-2 py-1 rounded border ${
                isLiveConnected
                  ? "bg-green-900/30 text-green-400 border-green-800"
                  : "bg-gray-900 text-gray-400 border-gray-800"
              }`}
            >
              {isLiveConnected ? "● BINANCE LIVE" : "◌ SIM MODE"}
            </span>
            <button
              onClick={toggleCommandPalette}
              className="hidden md:flex items-center gap-2 text-[10px] px-2 py-1 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="Open Command Palette"
            >
              <span>⌘</span>
              <span>Ctrl+K</span>
            </button>

            {user && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-[10px] text-gray-400 font-mono">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900/50 transition-all font-mono"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            {viewLabels[activeView]} • Institutional React / Next Trading Workspace
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <div className="rounded-lg border border-gray-900 bg-gray-950 px-3 py-2">
            <div className="text-gray-500">Feed</div>
            <div
              className={`flex items-center gap-2 ${
                isLiveConnected ? "text-green-400" : "text-yellow-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full animate-pulse ${
                  isLiveConnected ? "bg-green-400" : "bg-yellow-400"
                }`}
              />
              {isLiveConnected ? "Binance" : "Simulation"}
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
              {time ? time.toLocaleTimeString() : "—"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}