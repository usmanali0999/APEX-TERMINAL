# ADR 0002: Zustand for High-Frequency Market State

## Status

Accepted

## Context

The market engine streams price ticks, order book updates, and trade prints at ~3 FPS (300ms). Using React `useState` or `useContext` for this volume causes cascading re-renders and UI freezes.

## Decision

We use Zustand with atomic selectors for all high-frequency market state.

Components subscribe to only the slice they render:

```ts
const tick = useMarketStore((s) => s.tick);
const book = useMarketStore((s) => s.book);
```
