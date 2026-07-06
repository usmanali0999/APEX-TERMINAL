import { Candle, MarketTick, OrderBook, OrderBookEntry } from "@/domain/models/types";

export class MarketEngine {
  private price = 63850;
  private basePrice = 62000;
  private subscribers = new Set<(tick: MarketTick, book: OrderBook) => void>();
  private interval: NodeJS.Timeout | null = null;
  private candles: Candle[] = [];

  constructor() {
    const now = Date.now();
    for (let i = 50; i >= 0; i--) {
      const close = 63000 + (Math.random() - 0.5) * 1000;
      this.candles.push({
        timestamp: now - i * 3600000,
        open: close - 100,
        high: close + 200,
        low: close - 200,
        close,
        volume: 100 + Math.random() * 50,
      });
    }
  }

  getCandles() {
    return this.candles;
  }

  private generateOrderBook(price: number): OrderBook {
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];
    let cumBid = 0;
    let cumAsk = 0;

    for (let i = 1; i <= 10; i++) {
      const step = price * 0.0005 * i;
      const bidSize = Math.random() * 2;
      const askSize = Math.random() * 2;

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
      symbol: "BTC/USD",
      bids,
      asks,
      timestamp: Date.now(),
      spread: 1.5,
      spreadPercentage: 0.002,
    };
  }

  subscribe(cb: (tick: MarketTick, book: OrderBook) => void) {
    this.subscribers.add(cb);
  }

  start() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.price *= 1 + (Math.random() - 0.499) * 0.001;

      const tick: MarketTick = {
        symbol: "BTC/USD",
        price: Number(this.price.toFixed(2)),
        change24h: this.price - this.basePrice,
        change24hPercent: ((this.price - this.basePrice) / this.basePrice) * 100,
        high24h: 64500,
        low24h: 61500,
        volume24h: 4800,
        timestamp: Date.now(),
      };

      const book = this.generateOrderBook(this.price);

      this.subscribers.forEach((cb) => cb(tick, book));
    }, 300);
  }
}

export const marketEngine = new MarketEngine();