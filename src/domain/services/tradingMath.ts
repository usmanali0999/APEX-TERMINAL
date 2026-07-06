export function calculateEMA(prices: number[], period: number): number[] {
  if (!prices.length || period <= 0) return [];
  if (prices.length < period) return prices.map(() => NaN);

  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i] ?? 0;
  }

  let previousEma = sum / period;

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(NaN);
    } else if (i === period - 1) {
      ema.push(previousEma);
    } else {
      const currentEma = (prices[i] - previousEma) * multiplier + previousEma;
      ema.push(currentEma);
      previousEma = currentEma;
    }
  }

  return ema;
}

export function calculateMaxDrawdown(equitySeries: number[]): {
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  drawdownSeries: number[];
} {
  if (!equitySeries.length) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercentage: 0,
      drawdownSeries: [],
    };
  }

  let peak = equitySeries[0];
  let maxDrawdown = 0;
  let maxDrawdownPercentage = 0;
  const drawdownSeries: number[] = [];

  for (const equity of equitySeries) {
    if (equity > peak) {
      peak = equity;
    }

    const drawdown = peak - equity;
    const drawdownPercentage = peak > 0 ? (drawdown / peak) * 100 : 0;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercentage = drawdownPercentage;
    }

    drawdownSeries.push(drawdownPercentage);
  }

  return {
    maxDrawdown,
    maxDrawdownPercentage,
    drawdownSeries,
  };
}