"use client";

import { useMarketStore } from "@/application/store/marketStore";

export function TickerTape() {
  const allTicks = useMarketStore((s) => s.allTicks);
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol);
  const activeSymbol = useMarketStore((s) => s.activeSymbol);

  return (
    <div className="border-b border-gray-900 bg-black/95 px-4 py-2 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {allTicks.map((tick) => {
          const positive = tick.change24hPercent >= 0;
          const active = activeSymbol === tick.symbol;

          return (
            <button
              key={tick.symbol}
              onClick={() => setActiveSymbol(tick.symbol)}
              className={`px-3 py-2 rounded-lg border font-mono text-xs flex items-center gap-3 transition-all ${
                active
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-gray-900 bg-gray-950 hover:border-gray-700"
              }`}
            >
              <span className="text-white font-semibold">{tick.symbol}</span>
              <span className="text-gray-300">${tick.price.toLocaleString()}</span>
              <span
                className={positive ? "text-green-400" : "text-red-400"}
              >
                {positive ? "+" : ""}
                {tick.change24hPercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}