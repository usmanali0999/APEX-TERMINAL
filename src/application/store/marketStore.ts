import { create } from "zustand";
import { MarketTick, OrderBook, Candle, TradePrint } from "@/domain/models/types";
import { binanceMarketEngine } from "@/infrastructure/market-data/binanceAdapter";

interface MarketState {
  activeSymbol: string;
  allSymbols: string[];
  tick: MarketTick | null;
  allTicks: MarketTick[];
  book: OrderBook | null;
  candles: Candle[];
  trades: TradePrint[];
  isStarted: boolean;
  isLiveConnected: boolean;
  start: () => void;
  setActiveSymbol: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  activeSymbol: binanceMarketEngine.getActiveSymbol(),
  allSymbols: binanceMarketEngine.getAllSymbols(),
  tick: null,
  allTicks: binanceMarketEngine.getAllTicks(),
  book: null,
  candles:
    binanceMarketEngine.getSnapshot(binanceMarketEngine.getActiveSymbol())
      ?.candles ?? [],
  trades: [],
  isStarted: false,
  isLiveConnected: false,

  start: () => {
    if (get().isStarted) return;

    binanceMarketEngine.subscribe((tick, book, candles, trade) => {
      set((state) => ({
        tick,
        book,
        candles,
        allTicks: binanceMarketEngine.getAllTicks(),
        isLiveConnected: binanceMarketEngine.getConnectionStatus(),
        trades: trade ? [trade, ...state.trades].slice(0, 30) : state.trades,
      }));
    });

    binanceMarketEngine.start();
    set({ isStarted: true });

    // Check connection status every 3s
    setInterval(() => {
      set({ isLiveConnected: binanceMarketEngine.getConnectionStatus() });
    }, 3000);
  },

  setActiveSymbol: (symbol) => {
    binanceMarketEngine.setActiveSymbol(symbol);
    const snap = binanceMarketEngine.getSnapshot(symbol);
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