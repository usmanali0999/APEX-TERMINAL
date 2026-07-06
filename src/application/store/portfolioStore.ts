import { create } from "zustand";
import { useWorkspaceStore } from "@/application/store/workspaceStore";

export interface Position {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  leverage: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  openedAt: number;
}

interface PortfolioState {
  balance: number;
  positions: Position[];
  executeOrder: (
    symbol: string,
    side: "LONG" | "SHORT",
    price: number,
    quantity: number,
    leverage: number
  ) => { success: boolean; message: string };
  closePosition: (id: string, currentPrice: number) => void;
  updatePnl: (currentPrices: Record<string, number>) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  balance: 100000,
  positions: [],

  executeOrder: (symbol, side, price, quantity, leverage) => {
    const state = get();
    const notional = price * quantity;
    const margin = notional / leverage;

    if (margin > state.balance) {
      useWorkspaceStore
        .getState()
        .addLog(
          "WARN",
          `Rejected ${side} ${symbol} — insufficient margin ($${margin.toFixed(2)}).`
        );
      return {
        success: false,
        message: `Insufficient balance. Need $${margin.toFixed(2)}`,
      };
    }

    const liqPrice =
      side === "LONG"
        ? price * (1 - 1 / leverage)
        : price * (1 + 1 / leverage);

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol,
      side,
      entryPrice: price,
      quantity,
      leverage,
      liquidationPrice: Number(liqPrice.toFixed(2)),
      unrealizedPnl: 0,
      openedAt: Date.now(),
    };

    set((state) => ({
      balance: state.balance - margin,
      positions: [...state.positions, newPosition],
    }));

    useWorkspaceStore
      .getState()
      .addLog(
        "TRADE",
        `${side} ${quantity} ${symbol} @ $${price.toFixed(2)} • ${leverage}x`
      );

    return {
      success: true,
      message: `${side} order executed @ $${price.toFixed(2)}`,
    };
  },

  closePosition: (id, currentPrice) => {
    const state = get();
    const pos = state.positions.find((p) => p.id === id);
    if (!pos) return;

    const pnl =
      pos.side === "LONG"
        ? (currentPrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - currentPrice) * pos.quantity;

    const margin = (pos.entryPrice * pos.quantity) / pos.leverage;

    set((state) => ({
      balance: state.balance + margin + pnl,
      positions: state.positions.filter((p) => p.id !== id),
    }));

    useWorkspaceStore
      .getState()
      .addLog(
        pnl >= 0 ? "TRADE" : "WARN",
        `Closed ${pos.side} ${pos.symbol} @ $${currentPrice.toFixed(
          2
        )} • PnL ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`
      );
  },

  updatePnl: (currentPrices) => {
    set((state) => ({
      positions: state.positions.map((pos) => {
        const currentPrice = currentPrices[pos.symbol] ?? pos.entryPrice;
        const pnl =
          pos.side === "LONG"
            ? (currentPrice - pos.entryPrice) * pos.quantity
            : (pos.entryPrice - currentPrice) * pos.quantity;
        return { ...pos, unrealizedPnl: pnl };
      }),
    }));
  },
}));