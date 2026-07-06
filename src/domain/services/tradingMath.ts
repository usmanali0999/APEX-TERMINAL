export function calculateEMA(prices: number[], period: number): number[] {
  if (!prices.length || period <= 0) return [];

  const ema: number[] = [];
  const k = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i] ?? 0;
  }

  let prev = sum / period;

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(NaN);
    } else if (i === period - 1) {
      ema.push(prev);
    } else {
      const current = (prices[i] - prev) * k + prev;
      ema.push(current);
      prev = current;
    }
  }

  return ema;
}