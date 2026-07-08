import { describe, it, expect } from "vitest";
import {
  calculateReturns,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateCAGR,
  calculateTradeMetrics,
} from "../performanceMetrics";
import { BacktestTrade, EquityCurvePoint } from "@/domain/models/types";

describe("calculateReturns", () => {
  it("returns empty array for less than 2 points", () => {
    expect(calculateReturns([])).toEqual([]);
    expect(
      calculateReturns([{ timestamp: 0, equity: 100, drawdown: 0 }])
    ).toEqual([]);
  });

  it("calculates period returns correctly", () => {
    const curve: EquityCurvePoint[] = [
      { timestamp: 0, equity: 100, drawdown: 0 },
      { timestamp: 1, equity: 110, drawdown: 0 },
      { timestamp: 2, equity: 121, drawdown: 0 },
    ];
    const returns = calculateReturns(curve);
    expect(returns[0]).toBeCloseTo(0.1, 5);
    expect(returns[1]).toBeCloseTo(0.1, 5);
  });
});

describe("calculateSharpeRatio", () => {
  it("returns 0 for empty returns", () => {
    expect(calculateSharpeRatio([])).toBe(0);
  });

  it("returns 0 when stdDev is 0", () => {
    expect(calculateSharpeRatio([0.01, 0.01, 0.01])).toBe(0);
  });

  it("calculates positive Sharpe for positive returns", () => {
    const sharpe = calculateSharpeRatio([0.02, 0.01, 0.03, 0.015, 0.025]);
    expect(sharpe).toBeGreaterThan(0);
  });
});

describe("calculateSortinoRatio", () => {
  it("returns 0 when no negative returns", () => {
    expect(calculateSortinoRatio([0.01, 0.02, 0.03])).toBe(0);
  });

  it("calculates Sortino with downside risk", () => {
    const sortino = calculateSortinoRatio([0.02, -0.01, 0.03, -0.005, 0.025]);
    expect(typeof sortino).toBe("number");
  });
});

describe("calculateCAGR", () => {
  it("returns 0 for invalid inputs", () => {
    expect(calculateCAGR(0, 100, 0, 1000)).toBe(0);
    expect(calculateCAGR(100, 0, 0, 1000)).toBe(0);
  });

  it("calculates CAGR correctly for 1 year", () => {
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const cagr = calculateCAGR(1000, 1100, 0, oneYearMs);
    expect(cagr).toBeCloseTo(10, 1);
  });
});

describe("calculateTradeMetrics", () => {
  it("returns zeros for empty trades", () => {
    const metrics = calculateTradeMetrics([]);
    expect(metrics.profitFactor).toBe(0);
    expect(metrics.averageWin).toBe(0);
    expect(metrics.expectancy).toBe(0);
  });

  it("calculates profit factor correctly", () => {
    const trades: BacktestTrade[] = [
      {
        id: "1",
        side: "LONG",
        entryTimestamp: 0,
        exitTimestamp: 1,
        entryPrice: 100,
        exitPrice: 110,
        quantity: 1,
        pnl: 100,
        pnlPercentage: 10,
        reason: "BULLISH_CROSS",
      },
      {
        id: "2",
        side: "LONG",
        entryTimestamp: 2,
        exitTimestamp: 3,
        entryPrice: 100,
        exitPrice: 95,
        quantity: 1,
        pnl: -50,
        pnlPercentage: -5,
        reason: "BEARISH_CROSS",
      },
    ];
    const metrics = calculateTradeMetrics(trades);
    expect(metrics.profitFactor).toBe(2);
    expect(metrics.averageWin).toBe(100);
    expect(metrics.averageLoss).toBe(50);
    expect(metrics.largestWin).toBe(100);
    expect(metrics.largestLoss).toBe(-50);
  });
});