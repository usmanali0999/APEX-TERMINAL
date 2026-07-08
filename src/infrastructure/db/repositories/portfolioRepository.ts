import { db, schema } from "@/infrastructure/db/client";
import { eq } from "drizzle-orm";

export interface DbPortfolio {
  id: string;
  userId: string;
  balance: number;
  totalPnl: number;
  updatedAt: number;
}

export const portfolioRepository = {
  async getPortfolio(userId: string): Promise<DbPortfolio | null> {
    const rows = await db
      .select()
      .from(schema.portfoliosTable)
      .where(eq(schema.portfoliosTable.userId, userId))
      .limit(1);

    return rows[0] ?? null;
  },

  async updateBalance(
    userId: string,
    balance: number,
    totalPnl: number
  ): Promise<void> {
    await db
      .update(schema.portfoliosTable)
      .set({
        balance,
        totalPnl,
        updatedAt: Date.now(),
      })
      .where(eq(schema.portfoliosTable.userId, userId));
  },
};