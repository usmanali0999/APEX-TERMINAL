"use client";

import { useMarketStore } from "@/application/store/marketStore";

export function OrderBookPanel() {
  const book = useMarketStore((s) => s.book);

  if (!book) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[400px]">
        <div className="text-gray-500 font-mono">Loading Order Book...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[400px] flex flex-col">
      <div className="text-sm text-gray-400 mb-3 font-mono">
        Level 2 Order Book
      </div>

      <div className="grid grid-cols-3 text-xs text-gray-500 mb-2 font-mono">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-1">
        {book.asks.slice(0, 8).reverse().map((ask, i) => (
          <div
            key={i}
            className="relative grid grid-cols-3 text-xs font-mono px-1 py-1"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-red-500/10"
              style={{ width: `${ask.depthPercentage}%` }}
            />
            <span className="text-red-400 z-10">
              {ask.price.toFixed(2)}
            </span>
            <span className="text-right z-10">
              {ask.size.toFixed(3)}
            </span>
            <span className="text-right text-gray-500 z-10">
              {ask.total.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="text-center text-gray-400 text-xs py-2 border-y border-gray-800 font-mono">
        Spread: {book.spread}
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden space-y-1">
        {book.bids.slice(0, 8).map((bid, i) => (
          <div
            key={i}
            className="relative grid grid-cols-3 text-xs font-mono px-1 py-1"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-green-500/10"
              style={{ width: `${bid.depthPercentage}%` }}
            />
            <span className="text-green-400 z-10">
              {bid.price.toFixed(2)}
            </span>
            <span className="text-right z-10">
              {bid.size.toFixed(3)}
            </span>
            <span className="text-right text-gray-500 z-10">
              {bid.total.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}