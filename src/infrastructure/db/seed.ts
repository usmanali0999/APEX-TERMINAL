import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { db } from "./client";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding ApexPulse Terminal Database (Supabase PostgreSQL)...");

  const sql = postgres(process.env.DATABASE_URL!, {
    prepare: false,
  });

  // Drop existing tables
  await sql`DROP TABLE IF EXISTS trade_logs CASCADE`;
  await sql`DROP TABLE IF EXISTS positions CASCADE`;
  await sql`DROP TABLE IF EXISTS strategies CASCADE`;
  await sql`DROP TABLE IF EXISTS portfolios CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;

  // Create users table
  await sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;

  // Create portfolios table
  await sql`
    CREATE TABLE portfolios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      balance REAL NOT NULL DEFAULT 100000,
      total_pnl REAL NOT NULL DEFAULT 0,
      updated_at BIGINT NOT NULL
    )
  `;

  // Create positions table
  await sql`
    CREATE TABLE positions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      entry_price REAL NOT NULL,
      quantity REAL NOT NULL,
      leverage INTEGER NOT NULL DEFAULT 1,
      liquidation_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      realized_pnl REAL NOT NULL DEFAULT 0,
      opened_at BIGINT NOT NULL,
      closed_at BIGINT
    )
  `;

  // Create trade_logs table
  await sql`
    CREATE TABLE trade_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      position_id TEXT,
      action TEXT NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      pnl REAL,
      timestamp BIGINT NOT NULL
    )
  `;

  // Create strategies table
  await sql`
    CREATE TABLE strategies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      fast_period INTEGER NOT NULL,
      slow_period INTEGER NOT NULL,
      initial_capital REAL NOT NULL,
      order_size_percent REAL NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;

  await sql.end();

  console.log("✅ Tables created!");

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