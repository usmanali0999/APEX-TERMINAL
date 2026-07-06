import { create } from "zustand";
import { MarketTick, OrderBook, Candle } from "@/domain/models/types";
import { marketEngine } from "@/infrastructure/market-data/tickGenerator";

interface MarketState {
  tick: MarketTick | null;
  book: OrderBook | null;
  candles: Candle[];
  start: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  tick: null,
  book: null,
  candles: marketEngine.getCandles(),

  start: () => {
    marketEngine.start();
    marketEngine.subscribe((tick, book) => {
      set({ tick, book });
    });
  },
}));