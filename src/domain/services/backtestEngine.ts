import {
  AlgorithmicStrategyConfig,
  BacktestResult,
  BacktestTrade,
  Candle,
  EquityCurvePoint,
} from "@/domain/models/types";
import {
  calculateReturns,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateCAGR,
  calculateTradeMetrics,
} from "@/domain/services/performanceMetrics";
import { calculateEMA, calculateMaxDrawdown } from "@/domain/services/tradingMath";

type OpenPosition = {
  side: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  entryTimestamp: number;
};

export function runEmaCrossoverBacktest(
  config: AlgorithmicStrategyConfig,
  candles: Candle[]
): BacktestResult {
  const startedAt = performance.now();

  if (config.fastPeriod >= config.slowPeriod) {
    throw new Error("Fast EMA period must be smaller than Slow EMA period.");
  }

  if (candles.length < config.slowPeriod + 5) {
    throw new Error("Not enough candles to run backtest.");
  }

  const closes = candles.map((c) => c.close);
  const fastEma = calculateEMA(closes, config.fastPeriod);
  const slowEma = calculateEMA(closes, config.slowPeriod);

  let capital = config.initialCapital;
  let peakEquity = config.initialCapital;
  let currentPosition: OpenPosition | null = null;

  const trades: BacktestTrade[] = [];
  const equityCurve: EquityCurvePoint[] = [];

  const closePosition = (
    exitPrice: number,
    exitTimestamp: number,
    reason: BacktestTrade["reason"]
  ) => {
    if (!currentPosition) return;

    const pnl =
      currentPosition.side === "LONG"
        ? (exitPrice - currentPosition.entryPrice) * currentPosition.quantity
        : (currentPosition.entryPrice - exitPrice) * currentPosition.quantity;

    capital += pnl;

    trades.push({
      id: `trade-${trades.length + 1}`,
      side: currentPosition.side,
      entryTimestamp: currentPosition.entryTimestamp,
      exitTimestamp,
      entryPrice: currentPosition.entryPrice,
      exitPrice,
      quantity: currentPosition.quantity,
      pnl,
      pnlPercentage:
        ((exitPrice - currentPosition.entryPrice) / currentPosition.entryPrice) *
        100 *
        (currentPosition.side === "LONG" ? 1 : -1),
      reason,
    });

    currentPosition = null;
  };

  for (let i = 1; i < candles.length; i++) {
    const candle = candles[i];

    let markedEquity = capital;

    if (currentPosition) {
      const floatingPnl =
        currentPosition.side === "LONG"
          ? (candle.close - currentPosition.entryPrice) * currentPosition.quantity
          : (currentPosition.entryPrice - candle.close) * currentPosition.quantity;

      markedEquity += floatingPnl;
    }

    if (markedEquity > peakEquity) {
      peakEquity = markedEquity;
    }

    const drawdown = peakEquity > 0 ? ((peakEquity - markedEquity) / peakEquity) * 100 : 0;

    equityCurve.push({
      timestamp: candle.timestamp,
      equity: Number(markedEquity.toFixed(2)),
      drawdown: Number(drawdown.toFixed(2)),
    });

    if (
      Number.isNaN(fastEma[i]) ||
      Number.isNaN(slowEma[i]) ||
      Number.isNaN(fastEma[i - 1]) ||
      Number.isNaN(slowEma[i - 1])
    ) {
      continue;
    }

    const bullishCross = fastEma[i - 1] <= slowEma[i - 1] && fastEma[i] > slowEma[i];
    const bearishCross = fastEma[i - 1] >= slowEma[i - 1] && fastEma[i] < slowEma[i];

    if (!bullishCross && !bearishCross) continue;

    const signalSide: "LONG" | "SHORT" = bullishCross ? "LONG" : "SHORT";
    const signalReason: BacktestTrade["reason"] = bullishCross
      ? "BULLISH_CROSS"
      : "BEARISH_CROSS";

    if (!currentPosition) {
      const orderValue = capital * (config.orderSizePercent / 100);
      currentPosition = {
        side: signalSide,
        entryPrice: candle.close,
        quantity: orderValue / candle.close,
        entryTimestamp: candle.timestamp,
      };
    } else if (currentPosition.side !== signalSide) {
      closePosition(candle.close, candle.timestamp, signalReason);

      const orderValue = capital * (config.orderSizePercent / 100);
      currentPosition = {
        side: signalSide,
        entryPrice: candle.close,
        quantity: orderValue / candle.close,
        entryTimestamp: candle.timestamp,
      };
    }
  }

  const lastCandle = candles[candles.length - 1];
  if (currentPosition) {
    closePosition(lastCandle.close, lastCandle.timestamp, "END_OF_TEST");
  }

  const totalReturn = capital - config.initialCapital;
  const totalReturnPercentage = (totalReturn / config.initialCapital) * 100;
  const winningTrades = trades.filter((trade) => trade.pnl > 0).length;
  const losingTrades = trades.filter((trade) => trade.pnl < 0).length;
  const winRate = trades.length ? (winningTrades / trades.length) * 100 : 0;

  const { maxDrawdownPercentage } = calculateMaxDrawdown(
    equityCurve.map((point) => point.equity)
  );

  // Advanced Performance Metrics
  const returns = calculateReturns(equityCurve);
  const sharpeRatio = calculateSharpeRatio(returns);
  const sortinoRatio = calculateSortinoRatio(returns);
  const cagr =
    equityCurve.length > 1
      ? calculateCAGR(
          config.initialCapital,
          capital,
          equityCurve[0].timestamp,
          equityCurve[equityCurve.length - 1].timestamp
        )
      : 0;
  const tradeMetrics = calculateTradeMetrics(trades);

  return {
    config,
    initialCapital: config.initialCapital,
    finalCapital: Number(capital.toFixed(2)),
    totalReturn: Number(totalReturn.toFixed(2)),
    totalReturnPercentage: Number(totalReturnPercentage.toFixed(2)),
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate: Number(winRate.toFixed(2)),
    maxDrawdownPercentage: Number(maxDrawdownPercentage.toFixed(2)),
    trades,
    equityCurve,
    executionTimeMs: Number((performance.now() - startedAt).toFixed(2)),
    sharpeRatio: Number(sharpeRatio.toFixed(3)),
    sortinoRatio: Number(sortinoRatio.toFixed(3)),
    cagr: Number(cagr.toFixed(2)),
    profitFactor: tradeMetrics.profitFactor,
    averageWin: tradeMetrics.averageWin,
    averageLoss: tradeMetrics.averageLoss,
    expectancy: tradeMetrics.expectancy,
    largestWin: tradeMetrics.largestWin,
    largestLoss: tradeMetrics.largestLoss,
  };
}