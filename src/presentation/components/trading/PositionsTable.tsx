"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/application/store/marketStore";
import { usePortfolioStore } from "@/application/store/portfolioStore";

export function PositionsTable() {
  const tick = useMarketStore((s) => s.tick);
  const { positions, closePosition, updatePnl, balance } =
    usePortfolioStore();

  useEffect(() => {
    if (!tick) return;
    updatePnl({ "BTC/USD": tick.price });
  }, [tick, updatePnl]);

  if (!positions.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 font-mono">
        <div className="text-sm text-gray-400 mb-2">Open Positions</div>
        <div className="text-xs text-gray-600">No open positions.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 font-mono">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-400">Open Positions</div>
        <div className="text-sm text-green-400">
          Balance: ${balance.toFixed(2)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2">Symbol</th>
              <th className="text-left">Side</th>
              <th className="text-right">Entry</th>
              <th className="text-right">Mark</th>
              <th className="text-right">PnL</th>
              <th className="text-right">Liq.</th>
              <th className="text-right">Lev.</th>
              <th className="text-right">Close</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr
                key={pos.id}
                className="border-b border-gray-800/50 hover:bg-gray-800/30"
              >
                <td className="py-2">{pos.symbol}</td>
                <td
                  className={
                    pos.side === "LONG"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {pos.side}
                </td>
                <td className="text-right">
                  ${pos.entryPrice.toFixed(2)}
                </td>
                <td className="text-right">
                  ${tick?.price.toFixed(2) ?? "---"}
                </td>
                <td
                  className={`text-right ${
                    pos.unrealizedPnl >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {pos.unrealizedPnl >= 0 ? "+" : ""}$
                  {pos.unrealizedPnl.toFixed(2)}
                </td>
                <td className="text-right text-orange-400">
                  ${pos.liquidationPrice.toFixed(2)}
                </td>
                <td className="text-right">{pos.leverage}x</td>
                <td className="text-right">
                  <button
                    onClick={() =>
                      closePosition(pos.id, tick?.price ?? pos.entryPrice)
                    }
                    className="bg-gray-700 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-all"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}