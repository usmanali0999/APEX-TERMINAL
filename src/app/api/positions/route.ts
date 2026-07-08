import { NextRequest, NextResponse } from "next/server";
import { positionRepository } from "@/infrastructure/db/repositories/positionRepository";
import { tradeLogRepository } from "@/infrastructure/db/repositories/tradeLogRepository";
import { portfolioRepository } from "@/infrastructure/db/repositories/portfolioRepository";
import { getUserFromRequest } from "@/infrastructure/auth/getUser";

export async function GET(req: NextRequest) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const positions = await positionRepository.getOpenPositions(userId);
    const portfolio = await portfolioRepository.getPortfolio(userId);

    return NextResponse.json({
      positions,
      balance: portfolio?.balance ?? 100000,
    });
  } catch (error) {
    console.error("GET /api/positions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { symbol, side, price, quantity, leverage } = body;

    const notional = price * quantity;
    const margin = notional / leverage;

    const portfolio = await portfolioRepository.getPortfolio(userId);
    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    if (margin > portfolio.balance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const liquidationPrice =
      side === "LONG"
        ? price * (1 - 1 / leverage)
        : price * (1 + 1 / leverage);

    const positionId = `pos-${Date.now()}`;
    const now = Date.now();

    await positionRepository.createPosition({
      id: positionId,
      userId,
      symbol,
      side,
      entryPrice: price,
      quantity,
      leverage,
      liquidationPrice: Number(liquidationPrice.toFixed(2)),
      status: "OPEN",
      realizedPnl: 0,
      openedAt: now,
    });

    await tradeLogRepository.logTrade({
      id: `log-${now}`,
      userId,
      positionId,
      action: "OPEN",
      symbol,
      side,
      price,
      quantity,
      pnl: null,
      timestamp: now,
    });

    await portfolioRepository.updateBalance(
      userId,
      portfolio.balance - margin,
      portfolio.totalPnl
    );

    return NextResponse.json({
      success: true,
      positionId,
      liquidationPrice: Number(liquidationPrice.toFixed(2)),
    });
  } catch (error) {
    console.error("POST /api/positions error:", error);
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}