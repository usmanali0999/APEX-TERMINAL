import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const portfoliosTable = sqliteTable("portfolios", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  balance: real("balance").notNull().default(100000),
  totalPnl: real("total_pnl").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});

export const positionsTable = sqliteTable("positions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // LONG or SHORT
  entryPrice: real("entry_price").notNull(),
  quantity: real("quantity").notNull(),
  leverage: integer("leverage").notNull().default(1),
  liquidationPrice: real("liquidation_price").notNull(),
  status: text("status").notNull().default("OPEN"), // OPEN or CLOSED
  realizedPnl: real("realized_pnl").notNull().default(0),
  openedAt: integer("opened_at").notNull(),
  closedAt: integer("closed_at"),
});

export const tradeLogsTable = sqliteTable("trade_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  positionId: text("position_id").references(() => positionsTable.id),
  action: text("action").notNull(), // OPEN, CLOSE
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  price: real("price").notNull(),
  quantity: real("quantity").notNull(),
  pnl: real("pnl"),
  timestamp: integer("timestamp").notNull(),
});

export const strategiesTable = sqliteTable("strategies", {
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
  createdAt: integer("created_at").notNull(),
});