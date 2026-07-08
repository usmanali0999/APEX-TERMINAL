import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { db } from "./client";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding ApexPulse Terminal Database...");

  const sqlite = new Database("./apex-terminal.db");

  sqlite.exec(`
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS portfolios;
    DROP TABLE IF EXISTS positions;
    DROP TABLE IF EXISTS trade_logs;
    DROP TABLE IF EXISTS strategies;

    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE portfolios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 100000,
      total_pnl REAL NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE positions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      entry_price REAL NOT NULL,
      quantity REAL NOT NULL,
      leverage INTEGER NOT NULL DEFAULT 1,
      liquidation_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      realized_pnl REAL NOT NULL DEFAULT 0,
      opened_at INTEGER NOT NULL,
      closed_at INTEGER
    );
    CREATE TABLE trade_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      position_id TEXT,
      action TEXT NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      pnl REAL,
      timestamp INTEGER NOT NULL
    );
    CREATE TABLE strategies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      fast_period INTEGER NOT NULL,
      slow_period INTEGER NOT NULL,
      initial_capital REAL NOT NULL,
      order_size_percent REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.close();

  const now = Date.now();
  const userId = "user-apex-principal";
  const passwordHash = await bcrypt.hash("apex123", 10);

  await db.insert(schema.usersTable).values({
    id: userId,
    email: "principal@apexpulse.io",
    name: "Principal Quant",
    passwordHash,
    createdAt: now,
  });

  await db.insert(schema.portfoliosTable).values({
    id: "portfolio-1",
    userId,
    balance: 100000,
    totalPnl: 0,
    updatedAt: now,
  });

  await db.insert(schema.strategiesTable).values([
    {
      id: "strat-ema-fast",
      userId,
      name: "EMA 9/21 Momentum",
      symbol: "BTC/USD",
      fastPeriod: 9,
      slowPeriod: 21,
      initialCapital: 50000,
      orderSizePercent: 20,
      createdAt: now,
    },
    {
      id: "strat-ema-slow",
      userId,
      name: "EMA 20/50 Trend",
      symbol: "ETH/USD",
      fastPeriod: 20,
      slowPeriod: 50,
      initialCapital: 25000,
      orderSizePercent: 15,
      createdAt: now,
    },
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("📧 Login: principal@apexpulse.io");
  console.log("🔑 Password: apex123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});