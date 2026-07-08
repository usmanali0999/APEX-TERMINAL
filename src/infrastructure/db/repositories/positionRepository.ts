import { db, schema } from "@/infrastructure/db/client";
import { eq, and } from "drizzle-orm";

export interface DbPosition {
  id: string;
  userId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  leverage: number;
  liquidationPrice: number;
  status: "OPEN" | "CLOSED";
  realizedPnl: number;
  openedAt: number;
  closedAt: number | null;
}

export const positionRepository = {
  async getOpenPositions(userId: string): Promise<DbPosition[]> {
    const rows = await db
      .select()
      .from(schema.positionsTable)
      .where(
        and(
          eq(schema.positionsTable.userId, userId),
          eq(schema.positionsTable.status, "OPEN")
        )
      );

    return rows.map((r) => ({
      ...r,
      side: r.side as "LONG" | "SHORT",
      status: r.status as "OPEN" | "CLOSED",
    }));
  },

  async createPosition(position: Omit<DbPosition, "closedAt">): Promise<void> {
    await db.insert(schema.positionsTable).values({
      ...position,
      closedAt: null,
    });
  },

  async closePosition(
    id: string,
    realizedPnl: number,
    closedAt: number
  ): Promise<void> {
    await db
      .update(schema.positionsTable)
      .set({
        status: "CLOSED",
        realizedPnl,
        closedAt,
      })
      .where(eq(schema.positionsTable.id, id));
  },
};