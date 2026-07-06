# ADR 0001: Clean Architecture & Domain-Driven Design

## Status

Accepted

## Context

Standard Next.js apps mix UI, business logic, and database calls in a single file. For a high-frequency financial terminal with algorithmic strategies, real-time market data, and risk analytics, this becomes unmaintainable and untestable.

## Decision

We adopt a strict 4-layer Clean Architecture:

1. **Domain (`src/domain/`)** — Pure TypeScript. Zero UI/DB dependencies.
   - Models: `types.ts`
   - Services: `tradingMath.ts`, `backtestEngine.ts`

2. **Infrastructure (`src/infrastructure/`)** — External adapters.
   - Database: `db/schema.ts`, `db/client.ts`
   - Market feed: `market-data/tickGenerator.ts`

3. **Application (`src/application/`)** — Orchestration layer.
   - Zustand stores: `marketStore.ts`, `portfolioStore.ts`, `workspaceStore.ts`

4. **Presentation (`src/presentation/`)** — React UI.
   - Components grouped by feature: `trading/`, `algo/`, `analytics/`, `layout/`, `system/`

## Consequences

- Domain logic is 100% unit-testable without a browser or DB
- Infrastructure can be swapped (SQLite → PostgreSQL) without touching UI
- UI is thin and consumes atomic Zustand selectors for 60 FPS rendering
- Slight boilerplate overhead compared to inline scripting
