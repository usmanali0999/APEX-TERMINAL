import { create } from "zustand";
import {
  MarketTick,
  OrderBook,
  Candle,
  TradePrint,
} from "@/domain/models/types";
import { marketEngine } from "@/infrastructure/market-data/tickGenerator";

interface MarketState {
  activeSymbol: string;
  allSymbols: string[];
  tick: MarketTick | null;
  allTicks: MarketTick[];
  book: OrderBook | null;
  candles: Candle[];
  trades: TradePrint[];
  isStarted: boolean;
  start: () => void;
  setActiveSymbol: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  activeSymbol: marketEngine.getActiveSymbol(),
  allSymbols: marketEngine.getAllSymbols(),
  tick: null,
  allTicks: marketEngine.getAllTicks(),
  book: null,
  candles: marketEngine.getSnapshot(marketEngine.getActiveSymbol())?.candles ?? [],
  trades: [],
  isStarted: false,

  start: () => {
    if (get().isStarted) return;

    marketEngine.subscribe((tick, book, candles, trade) => {
      set((state) => ({
        tick,
        book,
        candles,
        allTicks: marketEngine.getAllTicks(),
        trades: trade
          ? [trade, ...state.trades].slice(0, 30)
          : state.trades,
      }));
    });

    marketEngine.start();
    set({ isStarted: true });
  },

  setActiveSymbol: (symbol) => {
    marketEngine.setActiveSymbol(symbol);
    const snap = marketEngine.getSnapshot(symbol);
    if (snap) {
      set({
        activeSymbol: symbol,
        tick: snap.tick,
        book: snap.book,
        candles: snap.candles,
      });
    }
  },
}));