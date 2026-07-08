import { db, schema } from "@/infrastructure/db/client";
import { eq, desc } from "drizzle-orm";

export interface DbTradeLog {
  id: string;
  userId: string;
  positionId: string | null;
  action: "OPEN" | "CLOSE";
  symbol: string;
  side: "LONG" | "SHORT";
  price: number;
  quantity: number;
  pnl: number | null;
  timestamp: number;
}

export const tradeLogRepository = {
  async getRecentLogs(userId: string, limit = 50): Promise<DbTradeLog[]> {
    const rows = await db
      .select()
      .from(schema.tradeLogsTable)
      .where(eq(schema.tradeLogsTable.userId, userId))
      .orderBy(desc(schema.tradeLogsTable.timestamp))
      .limit(limit);

    return rows.map((r) => ({
      ...r,
      action: r.action as "OPEN" | "CLOSE",
      side: r.side as "LONG" | "SHORT",
    }));
  },

  async logTrade(log: DbTradeLog): Promise<void> {
    await db.insert(schema.tradeLogsTable).values(log);
  },
};