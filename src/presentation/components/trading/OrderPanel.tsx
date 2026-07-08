"use client";

import { useState } from "react";
import { useMarketStore } from "@/application/store/marketStore";
import { usePortfolioStore } from "@/application/store/portfolioStore";

export function OrderPanel() {
  const tick = useMarketStore((s) => s.tick);
  const { balance, executeOrder } = usePortfolioStore();

  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [quantity, setQuantity] = useState("0.1");
  const [leverage, setLeverage] = useState(10);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const price = tick?.price ?? 0;
  const notional = price * parseFloat(quantity || "0");
  const margin = notional / leverage;
  const liqPrice =
    side === "LONG"
      ? price * (1 - 1 / leverage)
      : price * (1 + 1 / leverage);

  const handleOrder = async () => {
  if (!tick) return;

  const result = await executeOrder(
    "BTC/USD",
    side,
    tick.price,
    parseFloat(quantity),
    leverage
  );

  setMessage({ text: result.message, success: result.success });

  setTimeout(() => setMessage(null), 3000);
};

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 font-mono space-y-4">
      <div className="text-sm text-gray-400">Order Execution</div>

      {/* Side Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("LONG")}
          className={`py-2 rounded-lg text-sm font-bold transition-all ${
            side === "LONG"
              ? "bg-green-500 text-black"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          LONG
        </button>
        <button
          onClick={() => setSide("SHORT")}
          className={`py-2 rounded-lg text-sm font-bold transition-all ${
            side === "SHORT"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          SHORT
        </button>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          Quantity (BTC)
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          step="0.01"
          min="0.01"
        />
      </div>

      {/* Leverage */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          Leverage: {leverage}x
        </label>
        <input
          type="range"
          min={1}
          max={50}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>1x</span>
          <span>25x</span>
          <span>50x</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-950 rounded-lg p-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Mark Price</span>
          <span>${price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Notional Value</span>
          <span>${notional.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Required Margin</span>
          <span>${margin.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Liq. Price</span>
          <span className="text-orange-400">${liqPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-800 pt-1 mt-1">
          <span className="text-gray-500">Balance</span>
          <span className="text-green-400">
            ${balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleOrder}
        disabled={!tick}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
          side === "LONG"
            ? "bg-green-500 hover:bg-green-400 text-black"
            : "bg-red-500 hover:bg-red-400 text-white"
        } disabled:opacity-40`}
      >
        {side === "LONG" ? "BUY / LONG" : "SELL / SHORT"} BTC/USD
      </button>

      {/* Message */}
      {message && (
        <div
          className={`text-xs p-2 rounded-lg text-center ${
            message.success
              ? "bg-green-900 text-green-300"
              : "bg-red-900 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}