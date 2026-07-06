import { describe, it, expect } from "vitest";
import { runEmaCrossoverBacktest } from "../backtestEngine";
import { Candle } from "@/domain/models/types";

function makeCandles(prices: number[]): Candle[] {
  const now = Date.now();
  return prices.map((price, i) => ({
    timestamp: now + i * 3600000,
    open: price,
    high: price + 1,
    low: price - 1,
    close: price,
    volume: 100,
  }));
}

describe("runEmaCrossoverBacktest", () => {
  it("throws if fast >= slow period", () => {
    const candles = makeCandles(Array.from({ length: 50 }, (_, i) => 100 + i));
    expect(() =>
      runEmaCrossoverBacktest(
        {
          id: "s1",
          name: "bad",
          symbol: "BTC/USD",
          fastPeriod: 10,
          slowPeriod: 10,
          initialCapital: 10000,
          orderSizePercent: 20,
        },
        candles
      )
    ).toThrow();
  });

  it("throws if not enough candles", () => {
    const candles = makeCandles([100, 101, 102]);
    expect(() =>
      runEmaCrossoverBacktest(
        {
          id: "s1",
          name: "few",
          symbol: "BTC/USD",
          fastPeriod: 9,
          slowPeriod: 21,
          initialCapital: 10000,
          orderSizePercent: 20,
        },
        candles
      )
    ).toThrow();
  });

  it("produces backtest result with valid metrics", () => {
    const prices = Array.from({ length: 100 }, (_, i) =>
      100 + Math.sin(i / 5) * 10 + i * 0.3
    );
    const candles = makeCandles(prices);

    const result = runEmaCrossoverBacktest(
      {
        id: "s1",
        name: "EMA test",
        symbol: "BTC/USD",
        fastPeriod: 5,
        slowPeriod: 15,
        initialCapital: 10000,
        orderSizePercent: 20,
      },
      candles
    );

    expect(result.initialCapital).toBe(10000);
    expect(result.equityCurve.length).toBeGreaterThan(0);
    expect(result.executionTimeMs).toBeGreaterThan(0);
    expect(typeof result.winRate).toBe("number");
  });
});