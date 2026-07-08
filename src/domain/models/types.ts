export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketTick {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  depthPercentage: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
  spread: number;
  spreadPercentage: number;
}

export interface TradePrint {
  id: string;
  symbol: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
  timestamp: number;
}

export type WorkspaceView =
  | "TRADING"
  | "ALGO_STUDIO"
  | "RISK_DASHBOARD"
  | "SYSTEM_LOGS";

export type LogLevel = "INFO" | "TRADE" | "ALGO" | "WARN" | "ERROR";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

export interface AlgorithmicStrategyConfig {
  id: string;
  name: string;
  symbol: string;
  fastPeriod: number;
  slowPeriod: number;
  initialCapital: number;
  orderSizePercent: number;
}

export interface BacktestTrade {
  id: string;
  side: "LONG" | "SHORT";
  entryTimestamp: number;
  exitTimestamp: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercentage: number;
  reason: "BULLISH_CROSS" | "BEARISH_CROSS" | "END_OF_TEST";
}

export interface EquityCurvePoint {
  timestamp: number;
  equity: number;
  drawdown: number;
}

export interface BacktestResult {
  config: AlgorithmicStrategyConfig;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercentage: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDrawdownPercentage: number;
  trades: BacktestTrade[];
  equityCurve: EquityCurvePoint[];
  executionTimeMs: number;
  sharpeRatio: number;
  sortinoRatio: number;
  cagr: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
}