import { BacktestTrade, EquityCurvePoint } from "@/domain/models/types";

export function calculateReturns(equityCurve: EquityCurvePoint[]): number[] {
  if (equityCurve.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity;
    const curr = equityCurve[i].equity;
    if (prev > 0) {
      returns.push((curr - prev) / prev);
    }
  }
  return returns;
}

export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0
): number {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance =
    returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Annualized (assuming ~252 trading periods/year)
  const annualizedReturn = mean * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}

export function calculateSortinoRatio(
  returns: number[],
  riskFreeRate: number = 0
): number {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const negativeReturns = returns.filter((r) => r < 0);

  if (negativeReturns.length === 0) return 0;

  const downsideVariance =
    negativeReturns.reduce((s, r) => s + Math.pow(r, 2), 0) /
    negativeReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);

  if (downsideDeviation === 0) return 0;

  const annualizedReturn = mean * 252;
  const annualizedDownside = downsideDeviation * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedDownside;
}

export function calculateCAGR(
  initialCapital: number,
  finalCapital: number,
  startTimestamp: number,
  endTimestamp: number
): number {
  if (initialCapital <= 0 || finalCapital <= 0) return 0;

  const years = (endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24 * 365);
  if (years <= 0) return 0;

  return (Math.pow(finalCapital / initialCapital, 1 / years) - 1) * 100;
}

export function calculateTradeMetrics(trades: BacktestTrade[]) {
  if (trades.length === 0) {
    return {
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      expectancy: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);

  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  const averageWin =
    wins.length > 0 ? grossProfit / wins.length : 0;
  const averageLoss =
    losses.length > 0 ? grossLoss / losses.length : 0;

  const winRate = wins.length / trades.length;
  const lossRate = losses.length / trades.length;

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  const expectancy = winRate * averageWin - lossRate * averageLoss;

  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl)) : 0;
  const largestLoss =
    losses.length > 0 ? Math.min(...losses.map((t) => t.pnl)) : 0;

  return {
    profitFactor: Number(profitFactor.toFixed(2)),
    averageWin: Number(averageWin.toFixed(2)),
    averageLoss: Number(averageLoss.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
  };
}