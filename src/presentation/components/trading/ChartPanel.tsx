"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import { useMarketStore } from "@/application/store/marketStore";
import { calculateEMA } from "@/domain/services/tradingMath";

export function ChartPanel() {
  const candles = useMarketStore((s) => s.candles);

  const data = useMemo(() => {
    if (!candles.length) return [];

    const closes = candles.map((c) => c.close);
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);

    return candles.map((c, i) => ({
      time: new Date(c.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: c.close,
      ema9: !isNaN(ema9[i]) ? ema9[i] : null,
      ema21: !isNaN(ema21[i]) ? ema21[i] : null,
    }));
  }, [candles]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[400px]">
      <div className="text-sm text-gray-400 mb-3 font-mono">
        BTC/USD — Live Candle Chart (EMA 9 / 21)
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
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
            dataKey="price"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.1}
          />
          <Line
            type="monotone"
            dataKey="ema9"
            stroke="#f59e0b"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="ema21"
            stroke="#a855f7"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}