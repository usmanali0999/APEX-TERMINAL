import { describe, it, expect } from "vitest";
import { calculateEMA, calculateMaxDrawdown } from "../tradingMath";

describe("calculateEMA", () => {
  it("returns empty array for empty prices", () => {
    expect(calculateEMA([], 10)).toEqual([]);
  });

  it("returns NaN for prices shorter than period", () => {
    const result = calculateEMA([100, 101, 102], 5);
    expect(result.every((v) => Number.isNaN(v))).toBe(true);
  });

  it("calculates EMA correctly for known input", () => {
    const prices = [10, 12, 14, 16, 18, 20];
    const ema = calculateEMA(prices, 3);
    expect(ema[2]).toBe(12); // avg of first 3
    expect(ema[3]).toBeGreaterThan(12);
    expect(ema[5]).toBeGreaterThan(15);
  });

  it("EMA reacts faster with smaller period", () => {
    const prices = [100, 110, 120, 130, 140];
    const fast = calculateEMA(prices, 2);
    const slow = calculateEMA(prices, 4);
    expect(fast[4]).toBeGreaterThan(slow[4]);
  });
});

describe("calculateMaxDrawdown", () => {
  it("returns 0 for empty series", () => {
    const { maxDrawdown, maxDrawdownPercentage } = calculateMaxDrawdown([]);
    expect(maxDrawdown).toBe(0);
    expect(maxDrawdownPercentage).toBe(0);
  });

  it("computes drawdown correctly", () => {
    const equity = [100, 120, 110, 90, 130];
    const { maxDrawdown, maxDrawdownPercentage } = calculateMaxDrawdown(equity);
    expect(maxDrawdown).toBe(30); // peak 120 → trough 90
    expect(maxDrawdownPercentage).toBeCloseTo(25, 1);
  });

  it("returns 0 drawdown for monotonically increasing series", () => {
    const { maxDrawdown } = calculateMaxDrawdown([100, 110, 120, 130]);
    expect(maxDrawdown).toBe(0);
  });
});