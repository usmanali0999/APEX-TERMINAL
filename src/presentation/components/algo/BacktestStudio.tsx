"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useMarketStore } from "@/application/store/marketStore";
import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { BacktestResult } from "@/domain/models/types";
import { runEmaCrossoverBacktest } from "@/domain/services/backtestEngine";

export function BacktestStudio() {
  const candles = useMarketStore((state) => state.candles);
  const addLog = useWorkspaceStore((state) => state.addLog);

  const [fastPeriod, setFastPeriod] = useState(9);
  const [slowPeriod, setSlowPeriod] = useState(21);
  const [initialCapital, setInitialCapital] = useState(50000);
  const [orderSizePercent, setOrderSizePercent] = useState(20);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const chartData = useMemo(() => {
    if (!result) return [];

    return result.equityCurve.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      equity: Number(point.equity.toFixed(2)),
      drawdown: Number(point.drawdown.toFixed(2)),
    }));
  }, [result]);

  const handleRunBacktest = () => {
    try {
      const output = runEmaCrossoverBacktest(
        {
          id: `ema-${Date.now()}`,
          name: "EMA Crossover",
          symbol: "BTC/USD",
          fastPeriod,
          slowPeriod,
          initialCapital,
          orderSizePercent,
        },
        candles
      );

      setResult(output);

      addLog(
        "ALGO",
        `Backtest complete • Return ${output.totalReturnPercentage.toFixed(
          2
        )}% • Sharpe ${output.sharpeRatio.toFixed(2)} • DD ${output.maxDrawdownPercentage.toFixed(2)}%`
      );
    } catch (error) {
      addLog(
        "ERROR",
        error instanceof Error ? error.message : "Backtest failed."
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-900 bg-gray-950 p-4">
        <div className="text-sm text-gray-400 font-mono mb-4">
          EMA Crossover Backtest Studio
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Fast EMA
            </label>
            <input
              type="number"
              value={fastPeriod}
              onChange={(e) => setFastPeriod(Number(e.target.value))}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
              min={2}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Slow EMA
            </label>
            <input
              type="number"
              value={slowPeriod}
              onChange={(e) => setSlowPeriod(Number(e.target.value))}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
              min={3}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Initial Capital
            </label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
              min={1000}
              step={1000}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Order Size %
            </label>
            <input
              type="number"
              value={orderSizePercent}
              onChange={(e) => setOrderSizePercent(Number(e.target.value))}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
              min={1}
              max={100}
            />
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          className="mt-4 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm font-mono transition-all"
        >
          Run Quant Backtest
        </button>
      </div>

      {result ? (
        <>
          {/* Basic Metrics */}
          <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
            <BasicMetricCard
              label="Final Capital"
              value={`$${result.finalCapital.toLocaleString()}`}
            />
            <BasicMetricCard
              label="Return %"
              value={`${result.totalReturnPercentage.toFixed(2)}%`}
            />
            <BasicMetricCard label="Trades" value={String(result.totalTrades)} />
            <BasicMetricCard
              label="Win Rate"
              value={`${result.winRate.toFixed(2)}%`}
            />
            <BasicMetricCard
              label="Max DD"
              value={`${result.maxDrawdownPercentage.toFixed(2)}%`}
            />
            <BasicMetricCard
              label="Exec Time"
              value={`${result.executionTimeMs.toFixed(2)} ms`}
            />
          </div>

          {/* Advanced Performance Metrics */}
          <div className="rounded-xl border border-gray-900 bg-gray-950 p-4">
            <div className="text-sm text-gray-400 font-mono mb-4">
              📊 Advanced Performance Metrics (Institutional-Grade)
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <MetricCard
                label="Sharpe Ratio"
                value={result.sharpeRatio.toFixed(3)}
                hint={
                  result.sharpeRatio > 1
                    ? "Excellent"
                    : result.sharpeRatio > 0
                    ? "Positive"
                    : "Poor"
                }
                color={
                  result.sharpeRatio > 1
                    ? "text-green-400"
                    : result.sharpeRatio > 0
                    ? "text-cyan-400"
                    : "text-red-400"
                }
              />
              <MetricCard
                label="Sortino Ratio"
                value={result.sortinoRatio.toFixed(3)}
                hint={
                  result.sortinoRatio > 1
                    ? "Excellent"
                    : result.sortinoRatio > 0
                    ? "Positive"
                    : "Poor"
                }
                color={
                  result.sortinoRatio > 1
                    ? "text-green-400"
                    : result.sortinoRatio > 0
                    ? "text-cyan-400"
                    : "text-red-400"
                }
              />
              <MetricCard
                label="CAGR"
                value={`${result.cagr.toFixed(2)}%`}
                hint="Annualized"
                color={result.cagr >= 0 ? "text-green-400" : "text-red-400"}
              />
              <MetricCard
                label="Profit Factor"
                value={result.profitFactor.toFixed(2)}
                hint={result.profitFactor >= 1.5 ? "Strong" : "Weak"}
                color={
                  result.profitFactor >= 1.5
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              />
              <MetricCard
                label="Expectancy"
                value={`$${result.expectancy.toFixed(2)}`}
                hint="Per Trade"
                color={
                  result.expectancy >= 0 ? "text-green-400" : "text-red-400"
                }
              />
              <MetricCard
                label="Avg Win"
                value={`$${result.averageWin.toFixed(2)}`}
                color="text-green-400"
              />
              <MetricCard
                label="Avg Loss"
                value={`$${result.averageLoss.toFixed(2)}`}
                color="text-red-400"
              />
              <MetricCard
                label="Largest Win"
                value={`$${result.largestWin.toFixed(2)}`}
                color="text-green-400"
              />
              <MetricCard
                label="Largest Loss"
                value={`$${result.largestLoss.toFixed(2)}`}
                color="text-red-400"
              />
              <MetricCard
                label="Win / Loss"
                value={`${result.winningTrades} / ${result.losingTrades}`}
                color="text-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-900 bg-gray-950 p-4 h-[360px]">
              <div className="text-sm text-gray-400 font-mono mb-3">
                Equity Curve
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-900 bg-gray-950 p-4 h-[360px]">
              <div className="text-sm text-gray-400 font-mono mb-3">
                Drawdown Curve
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#ef4444"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-gray-900 bg-gray-950 p-4">
            <div className="text-sm text-gray-400 font-mono mb-3">
              Recent Trades
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-900 text-gray-500">
                    <th className="text-left py-2">Side</th>
                    <th className="text-right">Entry</th>
                    <th className="text-right">Exit</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">PnL</th>
                    <th className="text-right">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((trade) => (
                      <tr key={trade.id} className="border-b border-gray-900/60">
                        <td
                          className={`py-2 ${
                            trade.side === "LONG"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {trade.side}
                        </td>
                        <td className="text-right">
                          ${trade.entryPrice.toFixed(2)}
                        </td>
                        <td className="text-right">
                          ${trade.exitPrice.toFixed(2)}
                        </td>
                        <td className="text-right">
                          {trade.quantity.toFixed(4)}
                        </td>
                        <td
                          className={`text-right ${
                            trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </td>
                        <td className="text-right text-gray-400">
                          {trade.reason}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-800 bg-gray-950 p-8 text-center">
          <div className="text-gray-400 font-mono">
            Configure parameters and click{" "}
            <span className="text-cyan-300">Run Quant Backtest</span>.
          </div>
        </div>
      )}
    </div>
  );
}

function BasicMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-900 bg-gray-950 p-4">
      <div className="text-xs text-gray-500 font-mono">{label}</div>
      <div className="text-lg text-white font-semibold font-mono mt-2">
        {value}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  color = "text-white",
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="bg-black border border-gray-900 rounded-lg p-3">
      <div className="text-[10px] text-gray-500 font-mono uppercase">
        {label}
      </div>
      <div className={`text-base font-bold font-mono mt-1 ${color}`}>
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-gray-600 font-mono mt-1">{hint}</div>
      )}
    </div>
  );
}