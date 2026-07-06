"use client";

import { useMarketStore } from "@/application/store/marketStore";

export function RecentTrades() {
  const trades = useMarketStore((s) => s.trades);

  return (
    <div className="rounded-xl border border-gray-900 bg-gray-950 p-4 h-[400px] flex flex-col">
      <div className="text-sm text-gray-400 font-mono mb-3">Recent Trades</div>

      <div className="grid grid-cols-3 text-xs text-gray-500 mb-2 font-mono border-b border-gray-900 pb-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {trades.length === 0 ? (
          <div className="text-xs text-gray-600 font-mono">Waiting for prints...</div>
        ) : (
          trades.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-3 text-xs font-mono px-1 py-1"
            >
              <span
                className={
                  t.side === "BUY" ? "text-green-400" : "text-red-400"
                }
              >
                ${t.price.toFixed(2)}
              </span>
              <span className="text-right text-gray-300">
                {t.size.toFixed(3)}
              </span>
              <span className="text-right text-gray-500">
                {new Date(t.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}