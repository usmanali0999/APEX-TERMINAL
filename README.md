# ApexPulse Terminal

Institutional-Grade High-Frequency Trading Terminal built with Next.js 15, TypeScript, Zustand, and Recharts.

## Features

- Live multi-symbol ticker (BTC, ETH, SOL, NVDA)
- Real-time candlestick chart with EMA indicators
- Level 2 order book with depth visualization
- Order execution panel with leverage (1x-50x)
- Real-time PnL tracking
- Algorithmic backtesting studio
- Risk dashboard with VaR calculation
- Command palette (Ctrl+K)
- System logs

## Getting Started

Install dependencies:

    npm install

Run development server:

    npm run dev

Open http://localhost:3000

## Testing

    npm test
    npm run typecheck
    npm run lint

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Zustand (state management)
- Recharts (charts)
- SQLite + Drizzle ORM
- Vitest (testing)

## Architecture

Clean Architecture / Domain-Driven Design:

- `src/domain/` - Pure business logic
- `src/infrastructure/` - Database, market data
- `src/application/` - Zustand stores
- `src/presentation/` - React UI components

## License

MIT
