"use client";

import { useMarketStore } from "@/application/store/marketStore";
import { usePortfolioStore } from "@/application/store/portfolioStore";

export function MarketStats() {
  const tick = useMarketStore((state) => state.tick);
  const book = useMarketStore((state) => state.book);
  const positions = usePortfolioStore((state) => state.positions);
  const balance = usePortfolioStore((state) => state.balance);

  const usedMargin = positions.reduce((sum, position) => {
    return sum + (position.entryPrice * position.quantity) / position.leverage;
  }, 0);

  const cards = [
    {
      label: "24H High",
      value: tick ? `$${tick.high24h.toLocaleString()}` : "—",
    },
    {
      label: "24H Low",
      value: tick ? `$${tick.low24h.toLocaleString()}` : "—",
    },
    {
      label: "24H Volume",
      value: tick ? tick.volume24h.toLocaleString() : "—",
    },
    {
      label: "Spread",
      value: book ? `$${book.spread.toFixed(2)}` : "—",
    },
    {
      label: "Balance",
      value: `$${balance.toFixed(2)}`,
    },
    {
      label: "Used Margin",
      value: `$${usedMargin.toFixed(2)}`,
    },
    {
      label: "Open Positions",
      value: String(positions.length),
    },
    {
      label: "Daily Change",
      value: tick
        ? `${tick.change24hPercent >= 0 ? "+" : ""}${tick.change24hPercent.toFixed(2)}%`
        : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-900 bg-gray-950 p-4"
        >
          <div className="text-xs text-gray-500 font-mono">{card.label}</div>
          <div className="text-lg text-white font-semibold font-mono mt-2">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}