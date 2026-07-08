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

interface DbPositionResponse {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  leverage: number;
  liquidationPrice: number;
  openedAt: number;
}

interface PortfolioState {
  balance: number;
  positions: Position[];
  isLoading: boolean;
  loadFromDb: () => Promise<void>;
  executeOrder: (
    symbol: string,
    side: "LONG" | "SHORT",
    price: number,
    quantity: number,
    leverage: number
  ) => Promise<{ success: boolean; message: string }>;
  closePosition: (id: string, currentPrice: number) => Promise<void>;
  updatePnl: (currentPrices: Record<string, number>) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  balance: 100000,
  positions: [],
  isLoading: false,

  loadFromDb: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/positions");
      const data = await res.json();

      const positions: Position[] = data.positions.map(
        (p: DbPositionResponse) => ({
          id: p.id,
          symbol: p.symbol,
          side: p.side,
          entryPrice: p.entryPrice,
          quantity: p.quantity,
          leverage: p.leverage,
          liquidationPrice: p.liquidationPrice,
          unrealizedPnl: 0,
          openedAt: p.openedAt,
        })
      );

      set({
        balance: data.balance,
        positions,
        isLoading: false,
      });

      useWorkspaceStore
        .getState()
        .addLog("INFO", `Loaded ${positions.length} positions from database.`);
    } catch {
      set({ isLoading: false });
      useWorkspaceStore
        .getState()
        .addLog("ERROR", "Failed to load positions from database.");
    }
  },

  executeOrder: async (symbol, side, price, quantity, leverage) => {
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, side, price, quantity, leverage }),
      });

      const data = await res.json();

      if (!res.ok) {
        useWorkspaceStore
          .getState()
          .addLog("WARN", `Order rejected: ${data.error}`);
        return { success: false, message: data.error };
      }

      await get().loadFromDb();

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
    } catch {
      useWorkspaceStore
        .getState()
        .addLog("ERROR", "Order execution failed.");
      return { success: false, message: "Network error" };
    }
  },

  closePosition: async (id, currentPrice) => {
    try {
      const res = await fetch(`/api/positions/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPrice }),
      });

      const data = await res.json();

      if (!res.ok) {
        useWorkspaceStore
          .getState()
          .addLog("ERROR", `Close failed: ${data.error}`);
        return;
      }

      const pos = get().positions.find((p) => p.id === id);
      await get().loadFromDb();

      useWorkspaceStore
        .getState()
        .addLog(
          data.pnl >= 0 ? "TRADE" : "WARN",
          `Closed ${pos?.side} ${pos?.symbol} @ $${currentPrice.toFixed(
            2
          )} • PnL ${data.pnl >= 0 ? "+" : ""}$${data.pnl.toFixed(2)}`
        );
    } catch {
      useWorkspaceStore
        .getState()
        .addLog("ERROR", "Close position failed.");
    }
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