import {
  Candle,
  MarketTick,
  OrderBook,
  OrderBookEntry,
  TradePrint,
} from "@/domain/models/types";

type BinanceSubscriber = (
  tick: MarketTick,
  book: OrderBook,
  candles: Candle[],
  trade: TradePrint | null
) => void;

interface SymbolConfig {
  displaySymbol: string;
  binanceSymbol: string;
  basePrice: number;
}

const SYMBOL_MAP: Record<string, SymbolConfig> = {
  "BTC/USD": {
    displaySymbol: "BTC/USD",
    binanceSymbol: "btcusdt",
    basePrice: 63000,
  },
  "ETH/USD": {
    displaySymbol: "ETH/USD",
    binanceSymbol: "ethusdt",
    basePrice: 3400,
  },
  "SOL/USD": {
    displaySymbol: "SOL/USD",
    binanceSymbol: "solusdt",
    basePrice: 170,
  },
  NVDA: {
    displaySymbol: "NVDA",
    binanceSymbol: "",
    basePrice: 128,
  },
};

interface SymbolState {
  symbol: string;
  price: number;
  basePrice: number;
  volatility: number;
  candles: Candle[];
  volume24h: number;
  high24h: number;
  low24h: number;
}

export class BinanceMarketEngine {
  private symbols = new Map<string, SymbolState>();
  private subscribers = new Set<BinanceSubscriber>();
  private wsConnections = new Map<string, WebSocket>();
  private activeSymbol = "BTC/USD";
  private simulationInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    const now = Date.now();

    for (const [symbol, config] of Object.entries(SYMBOL_MAP)) {
      const candles: Candle[] = [];

      for (let i = 50; i >= 0; i--) {
        const close =
          config.basePrice + (Math.random() - 0.5) * config.basePrice * 0.02;
        candles.push({
          timestamp: now - i * 3600000,
          open: close - config.basePrice * 0.002,
          high: close + config.basePrice * 0.004,
          low: close - config.basePrice * 0.004,
          close,
          volume: 100 + Math.random() * 40,
        });
      }

      this.symbols.set(symbol, {
        symbol,
        price: config.basePrice,
        basePrice: config.basePrice,
        volatility: 0.0012,
        candles,
        volume24h: 4800,
        high24h: config.basePrice * 1.02,
        low24h: config.basePrice * 0.98,
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
    return Array.from(this.symbols.values()).map((state) =>
      this.buildTick(state)
    );
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  private buildTick(state: SymbolState): MarketTick {
    return {
      symbol: state.symbol,
      price: Number(state.price.toFixed(2)),
      change24h: Number((state.price - state.basePrice).toFixed(2)),
      change24hPercent: Number(
        (((state.price - state.basePrice) / state.basePrice) * 100).toFixed(2)
      ),
      high24h: Number(state.high24h.toFixed(2)),
      low24h: Number(state.low24h.toFixed(2)),
      volume24h: Number(state.volume24h.toFixed(0)),
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

  subscribe(callback: BinanceSubscriber) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private emitUpdate(trade: TradePrint | null = null) {
    const activeState = this.symbols.get(this.activeSymbol);
    if (!activeState) return;

    const tick = this.buildTick(activeState);
    const book = this.buildOrderBook(activeState.price);
    const candles = activeState.candles.map((c) => ({ ...c }));

    this.subscribers.forEach((cb) => cb(tick, book, candles, trade));
  }

  connectBinance() {
    if (typeof window === "undefined") return;

    const streams = Object.values(SYMBOL_MAP)
      .filter((s) => s.binanceSymbol)
      .map((s) => `${s.binanceSymbol}@ticker`)
      .join("/");

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        this.isConnected = true;
        console.log("✅ Binance WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const data = message.data;

          if (!data || !data.s) return;

          const binanceSymbol = data.s.toLowerCase();
          const displayEntry = Object.entries(SYMBOL_MAP).find(
            ([, config]) => config.binanceSymbol === binanceSymbol
          );

          if (!displayEntry) return;

          const [displaySymbol] = displayEntry;
          const state = this.symbols.get(displaySymbol);
          if (!state) return;

          const newPrice = parseFloat(data.c);
          state.price = newPrice;
          state.high24h = parseFloat(data.h);
          state.low24h = parseFloat(data.l);
          state.volume24h = parseFloat(data.v);

          const latest = state.candles[state.candles.length - 1];
          latest.close = newPrice;
          latest.high = Math.max(latest.high, newPrice);
          latest.low = Math.min(latest.low, newPrice);

          if (displaySymbol === this.activeSymbol) {
            const trade: TradePrint = {
              id: `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              symbol: displaySymbol,
              price: newPrice,
              size: Number((Math.random() * 0.5 + 0.05).toFixed(3)),
              side: Math.random() > 0.5 ? "BUY" : "SELL",
              timestamp: Date.now(),
            };
            this.emitUpdate(trade);
          }
        } catch (err) {
          console.error("Binance parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("Binance WebSocket error:", err);
        this.isConnected = false;
      };

      ws.onclose = () => {
        this.isConnected = false;
        console.log("❌ Binance disconnected. Reconnecting in 5s...");
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connectBinance();
        }, 5000);
      };

      this.wsConnections.set("main", ws);
    } catch (err) {
      console.error("WebSocket connection failed:", err);
      this.isConnected = false;
    }
  }

  private runSimulation() {
    if (this.simulationInterval) return;

    let tickCounter = 0;

    this.simulationInterval = setInterval(() => {
      tickCounter += 1;

      // Only simulate NVDA (no Binance stream)
      const nvdaState = this.symbols.get("NVDA");
      if (nvdaState) {
        nvdaState.price *= 1 + (Math.random() - 0.499) * 0.0009;
        nvdaState.price = Number(nvdaState.price.toFixed(2));
        const latest = nvdaState.candles[nvdaState.candles.length - 1];
        latest.close = nvdaState.price;
        latest.high = Math.max(latest.high, nvdaState.price);
        latest.low = Math.min(latest.low, nvdaState.price);
      }

      // If Binance disconnected, simulate all
      if (!this.isConnected) {
        for (const state of this.symbols.values()) {
          if (state.symbol === "NVDA") continue;
          state.price *= 1 + (Math.random() - 0.499) * state.volatility;
          state.price = Number(state.price.toFixed(2));
          const latest = state.candles[state.candles.length - 1];
          latest.close = state.price;
          latest.high = Math.max(latest.high, state.price);
          latest.low = Math.min(latest.low, state.price);
        }
      }

      // New candle every 8 ticks
      if (tickCounter % 8 === 0) {
        for (const state of this.symbols.values()) {
          state.candles.push({
            timestamp: Date.now(),
            open: state.price,
            high: state.price,
            low: state.price,
            close: state.price,
            volume: Number((10 + Math.random() * 10).toFixed(2)),
          });
          if (state.candles.length > 80) state.candles.shift();
        }
      }

      this.emitUpdate();
    }, 500);
  }

  start() {
    this.connectBinance();
    this.runSimulation();
  }

  stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.wsConnections.forEach((ws) => ws.close());
    this.wsConnections.clear();
    this.isConnected = false;
  }
}

export const binanceMarketEngine = new BinanceMarketEngine();