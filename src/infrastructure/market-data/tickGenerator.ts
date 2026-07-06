import {
  Candle,
  MarketTick,
  OrderBook,
  OrderBookEntry,
  TradePrint,
} from "@/domain/models/types";

type MarketSubscriber = (
  tick: MarketTick,
  book: OrderBook,
  candles: Candle[],
  trade: TradePrint | null
) => void;

interface SymbolState {
  symbol: string;
  price: number;
  basePrice: number;
  volatility: number;
  candles: Candle[];
}

const SYMBOLS: Record<string, { price: number; volatility: number }> = {
  "BTC/USD": { price: 63850, volatility: 0.0012 },
  "ETH/USD": { price: 3450, volatility: 0.0018 },
  "SOL/USD": { price: 172, volatility: 0.0025 },
  NVDA: { price: 128, volatility: 0.0009 },
};

export class MarketEngine {
  private symbols = new Map<string, SymbolState>();
  private subscribers = new Set<MarketSubscriber>();
  private interval: NodeJS.Timeout | null = null;
  private tickCounter = 0;
  private activeSymbol = "BTC/USD";

  constructor() {
    const now = Date.now();

    for (const [symbol, config] of Object.entries(SYMBOLS)) {
      const candles: Candle[] = [];

      for (let i = 50; i >= 0; i--) {
        const close = config.price + (Math.random() - 0.5) * config.price * 0.02;
        candles.push({
          timestamp: now - i * 3600000,
          open: close - config.price * 0.002,
          high: close + config.price * 0.004,
          low: close - config.price * 0.004,
          close,
          volume: 100 + Math.random() * 40,
        });
      }

      this.symbols.set(symbol, {
        symbol,
        price: config.price,
        basePrice: config.price,
        volatility: config.volatility,
        candles,
      });
    }
  }

  getAllSymbols(): string[] {
    return Array.from(this.symbols.keys());
  }

  getSnapshot(symbol: string) {
    const state = this.symbols.get(symbol);
    if (!state) return null;

    return {
      tick: this.buildTick(state),
      book: this.buildOrderBook(state.price),
      candles: state.candles.map((c) => ({ ...c })),
    };
  }

  setActiveSymbol(symbol: string) {
    if (this.symbols.has(symbol)) {
      this.activeSymbol = symbol;
    }
  }

  getActiveSymbol() {
    return this.activeSymbol;
  }

  getAllTicks(): MarketTick[] {
    return Array.from(this.symbols.values()).map((state) => this.buildTick(state));
  }

  private buildTick(state: SymbolState): MarketTick {
    return {
      symbol: state.symbol,
      price: Number(state.price.toFixed(2)),
      change24h: Number((state.price - state.basePrice).toFixed(2)),
      change24hPercent: Number(
        (((state.price - state.basePrice) / state.basePrice) * 100).toFixed(2)
      ),
      high24h: Number((state.basePrice * 1.02).toFixed(2)),
      low24h: Number((state.basePrice * 0.98).toFixed(2)),
      volume24h: 4800,
      timestamp: Date.now(),
    };
  }

  private buildOrderBook(price: number): OrderBook {
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];
    let cumBid = 0;
    let cumAsk = 0;

    for (let i = 1; i <= 10; i++) {
      const step = price * 0.0005 * i;
      const bidSize = Math.random() * 2 + 0.2;
      const askSize = Math.random() * 2 + 0.2;

      cumBid += bidSize;
      cumAsk += askSize;

      bids.push({
        price: Number((price - step).toFixed(2)),
        size: Number(bidSize.toFixed(3)),
        total: Number(cumBid.toFixed(3)),
        depthPercentage: i * 10,
      });

      asks.push({
        price: Number((price + step).toFixed(2)),
        size: Number(askSize.toFixed(3)),
        total: Number(cumAsk.toFixed(3)),
        depthPercentage: i * 10,
      });
    }

    return {
      symbol: this.activeSymbol,
      bids,
      asks,
      timestamp: Date.now(),
      spread: Number((asks[0].price - bids[0].price).toFixed(2)),
      spreadPercentage: 0.002,
    };
  }

  subscribe(callback: MarketSubscriber) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  start() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.tickCounter += 1;

      for (const state of this.symbols.values()) {
        state.price *= 1 + (Math.random() - 0.499) * state.volatility;
        state.price = Number(state.price.toFixed(2));

        const latest = state.candles[state.candles.length - 1];
        latest.close = state.price;
        latest.high = Math.max(latest.high, state.price);
        latest.low = Math.min(latest.low, state.price);
        latest.volume = Number((latest.volume + Math.random() * 3).toFixed(2));

        if (this.tickCounter % 10 === 0) {
          state.candles.push({
            timestamp: Date.now(),
            open: state.price,
            high: state.price,
            low: state.price,
            close: state.price,
            volume: Number((10 + Math.random() * 10).toFixed(2)),
          });

          if (state.candles.length > 80) {
            state.candles.shift();
          }
        }
      }

      const activeState = this.symbols.get(this.activeSymbol)!;
      const tick = this.buildTick(activeState);
      const book = this.buildOrderBook(activeState.price);
      const candles = activeState.candles.map((c) => ({ ...c }));

      let trade: TradePrint | null = null;
      if (Math.random() > 0.5) {
        trade = {
          id: `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          symbol: activeState.symbol,
          price: activeState.price,
          size: Number((Math.random() * 0.5 + 0.05).toFixed(3)),
          side: Math.random() > 0.5 ? "BUY" : "SELL",
          timestamp: Date.now(),
        };
      }

      this.subscribers.forEach((cb) => cb(tick, book, candles, trade));
    }, 300);
  }
}

export const marketEngine = new MarketEngine();