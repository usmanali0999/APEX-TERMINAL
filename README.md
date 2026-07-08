# ⚡ ApexPulse Terminal

**Institutional-Grade High-Frequency Trading & Algorithmic Backtesting Suite**

A production-ready trading terminal built with Next.js 15, TypeScript, and Clean Architecture. Features real-time market data from Binance WebSocket, JWT authentication, algorithmic backtesting with institutional performance metrics, and full CI/CD pipeline.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-passing-green)
![CI](https://img.shields.io/badge/CI-passing-green)

---

## 🎯 Key Features

### 📈 Trading Desk
- **Real-time Binance WebSocket** integration (BTC, ETH, SOL live prices)
- Multi-symbol ticker tape with instant symbol switching
- Live candlestick chart with EMA 9 / EMA 21 overlays
- Level 2 order book with depth visualization
- Order execution panel (LONG/SHORT, 1x–50x leverage)
- Automatic liquidation price calculation
- Real-time PnL tracking and open positions blotter
- Recent trades feed (tape reader)

### 🤖 Algo Studio (Backtesting Engine)
- **EMA Crossover Strategy** with configurable parameters
- Interactive equity curve & drawdown visualization
- Trade-by-trade breakdown with entry/exit signals

### 📊 Institutional Performance Metrics
- **Sharpe Ratio** (risk-adjusted return)
- **Sortino Ratio** (downside risk)
- **CAGR** (Compound Annual Growth Rate)
- **Profit Factor** (gross profit / gross loss)
- **Expectancy** per trade
- Average Win/Loss, Largest Win/Loss
- Max Drawdown

### 🛡️ Risk Dashboard
- Total equity, margin utilization, VaR (95% confidence)
- Position allocation pie chart
- Real-time margin utilization gauge (green/yellow/red states)

### 🔐 Authentication
- JWT-based session management (HTTP-only cookies)
- Bcrypt password hashing
- Multi-user support with isolated portfolios
- Protected routes via Next.js middleware

### 💾 Trade Persistence
- SQLite database with Drizzle ORM
- Positions, trade logs, portfolios persisted
- Full transaction history

### 💻 Developer Experience
- Command Palette (`Ctrl+K` / `Cmd+K`)
- System logs panel with color-coded severity
- Mobile-responsive with bottom navigation
- PWA (installable on mobile/desktop)

---

## 🏗️ Architecture — Clean Architecture / DDD
src/
├── domain/              # Pure business logic (100% testable)
│   ├── models/          # Type definitions
│   └── services/        # Trading math, backtest engine, performance metrics
│
├── infrastructure/      # External adapters
│   ├── db/              # Drizzle schema, repositories
│   ├── auth/            # JWT signing, verification
│   └── market-data/     # Binance WebSocket adapter
│
├── application/         # State orchestration
│   └── store/           # Zustand stores (market, portfolio, auth, workspace)
│
└── presentation/        # React UI layer
    └── components/
        ├── layout/      # Header, Sidebar, Command Palette
        ├── trading/     # Chart, Order Book, Positions
        ├── algo/        # Backtest Studio
        ├── analytics/   # Risk Dashboard
        └── system/      # System Logs

See `docs/adr/` for architectural decisions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- npm 10+

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/apex-terminal.git
cd apex-terminal
npm install
