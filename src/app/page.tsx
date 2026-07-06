"use client";
import { useEffect } from "react";
import { useMarketStore } from "@/application/store/marketStore";

export default function Home() {
  const start = useMarketStore((s) => s.start);
  const tick = useMarketStore((s) => s.tick);

  useEffect(() => {
    start();
  }, [start]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      {tick ? (
        <div className="text-center font-mono">
          <h1 className="text-2xl font-bold mb-4">BTC/USD</h1>
          <div className="text-4xl">${tick.price.toLocaleString()}</div>
          <div className={tick.change24h >= 0 ? "text-green-400" : "text-red-400"}>
            {tick.change24hPercent.toFixed(2)}%
          </div>
        </div>
      ) : (
        <div>Connecting to Market Engine...</div>
      )}
    </main>
  );
}