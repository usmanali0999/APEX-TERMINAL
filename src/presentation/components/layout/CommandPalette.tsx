"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { useMarketStore } from "@/application/store/marketStore";
import { WorkspaceView } from "@/domain/models/types";

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

export function CommandPalette() {
  const isOpen = useWorkspaceStore((s) => s.isCommandPaletteOpen);
  const setOpen = useWorkspaceStore((s) => s.setCommandPaletteOpen);
  const toggle = useWorkspaceStore((s) => s.toggleCommandPalette);
  const setActiveView = useWorkspaceStore((s) => s.setActiveView);
  const symbols = useMarketStore((s) => s.allSymbols);
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol);

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, setOpen]);

  if (!isOpen) return null;

  const views: { view: WorkspaceView; label: string }[] = [
    { view: "TRADING", label: "Go to Trading Desk" },
    { view: "ALGO_STUDIO", label: "Go to Algo Studio" },
    { view: "RISK_DASHBOARD", label: "Go to Risk Dashboard" },
    { view: "SYSTEM_LOGS", label: "Go to System Logs" },
  ];

  const commands: Command[] = [
    ...views.map<Command>((v) => ({
      id: `view-${v.view}`,
      label: v.label,
      hint: "View",
      run: () => {
        setActiveView(v.view);
        setOpen(false);
      },
    })),
    ...symbols.map<Command>((sym) => ({
      id: `sym-${sym}`,
      label: `Switch Symbol → ${sym}`,
      hint: "Symbol",
      run: () => {
        setActiveSymbol(sym);
        setOpen(false);
      },
    })),
  ];

  const filtered = query
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-start justify-center pt-32"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Search commands, symbols, views..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-black text-white px-4 py-3 text-sm border-b border-gray-800 outline-none font-mono"
        />

        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 font-mono">
              No commands found.
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={c.run}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-200 hover:bg-cyan-500/10 border-b border-gray-900 font-mono text-left"
              >
                <span>{c.label}</span>
                <span className="text-[10px] text-gray-500 uppercase">
                  {c.hint}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 text-[10px] text-gray-500 border-t border-gray-800 font-mono flex justify-between">
          <span>↑↓ navigate</span>
          <span>Ctrl+K to toggle</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}