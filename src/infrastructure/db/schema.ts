import { pgTable, text, real, integer, bigint } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const portfoliosTable = pgTable("portfolios", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  balance: real("balance").notNull().default(100000),
  totalPnl: real("total_pnl").notNull().default(0),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const positionsTable = pgTable("positions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  entryPrice: real("entry_price").notNull(),
  quantity: real("quantity").notNull(),
  leverage: integer("leverage").notNull().default(1),
  liquidationPrice: real("liquidation_price").notNull(),
  status: text("status").notNull().default("OPEN"),
  realizedPnl: real("realized_pnl").notNull().default(0),
  openedAt: bigint("opened_at", { mode: "number" }).notNull(),
  closedAt: bigint("closed_at", { mode: "number" }),
});

export const tradeLogsTable = pgTable("trade_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  positionId: text("position_id"),
  action: text("action").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  price: real("price").notNull(),
  quantity: real("quantity").notNull(),
  pnl: real("pnl"),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

export const strategiesTable = pgTable("strategies", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  fastPeriod: integer("fast_period").notNull(),
  slowPeriod: integer("slow_period").notNull(),
  initialCapital: real("initial_capital").notNull(),
  orderSizePercent: real("order_size_percent").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});