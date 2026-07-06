"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { usePortfolioStore } from "@/application/store/portfolioStore";
import { useMarketStore } from "@/application/store/marketStore";

const COLORS = ["#22c55e", "#0ea5e9", "#a855f7", "#f59e0b", "#ef4444"];

export function RiskDashboard() {
  const positions = usePortfolioStore((s) => s.positions);
  const balance = usePortfolioStore((s) => s.balance);
  const tick = useMarketStore((s) => s.tick);

  const usedMargin = positions.reduce(
    (sum, p) => sum + (p.entryPrice * p.quantity) / p.leverage,
    0
  );

  const totalNotional = positions.reduce(
    (sum, p) => sum + p.entryPrice * p.quantity,
    0
  );

  const equity =
    balance +
    positions.reduce((sum, p) => {
      const price = tick?.symbol === p.symbol ? tick.price : p.entryPrice;
      const pnl =
        p.side === "LONG"
          ? (price - p.entryPrice) * p.quantity
          : (p.entryPrice - price) * p.quantity;
      return sum + pnl + (p.entryPrice * p.quantity) / p.leverage;
    }, 0);

  const marginUtil = equity > 0 ? (usedMargin / equity) * 100 : 0;
  const var95 = totalNotional * 0.0325;

  const allocation = positions.map((p) => ({
    name: `${p.symbol} ${p.side}`,
    value: p.entryPrice * p.quantity,
  }));

  const cards = [
    { label: "Total Equity", value: `$${equity.toFixed(2)}` },
    { label: "Cash Balance", value: `$${balance.toFixed(2)}` },
    { label: "Used Margin", value: `$${usedMargin.toFixed(2)}` },
    { label: "Notional Exposure", value: `$${totalNotional.toFixed(2)}` },
    { label: "Margin Utilization", value: `${marginUtil.toFixed(2)}%` },
    { label: "VaR (95%, 1D)", value: `-$${var95.toFixed(2)}` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-900 bg-gray-950 p-4"
          >
            <div className="text-xs text-gray-500 font-mono">{c.label}</div>
            <div className="text-lg text-white font-semibold font-mono mt-2">
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-900 bg-gray-950 p-4">
          <div className="text-sm text-gray-400 font-mono mb-3">
            Margin Utilization
          </div>
          <div className="h-6 w-full bg-gray-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                marginUtil > 70
                  ? "bg-red-500"
                  : marginUtil > 40
                  ? "bg-yellow-500"
                  : "bg-green-500"
              } transition-all`}
              style={{ width: `${Math.min(marginUtil, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 font-mono mt-2">
            {marginUtil.toFixed(2)}% of equity in use
          </div>
        </div>

        <div className="rounded-xl border border-gray-900 bg-gray-950 p-4 h-[280px]">
          <div className="text-sm text-gray-400 font-mono mb-3">
            Position Allocation
          </div>
          {allocation.length === 0 ? (
            <div className="text-xs text-gray-500 font-mono">
              No open positions.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  innerRadius={40}
                >
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}