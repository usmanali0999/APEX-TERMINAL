import { NextRequest, NextResponse } from "next/server";
import { positionRepository } from "@/infrastructure/db/repositories/positionRepository";
import { tradeLogRepository } from "@/infrastructure/db/repositories/tradeLogRepository";
import { portfolioRepository } from "@/infrastructure/db/repositories/portfolioRepository";
import { getUserFromRequest } from "@/infrastructure/auth/getUser";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { currentPrice } = body;

    const positions = await positionRepository.getOpenPositions(userId);
    const position = positions.find((p) => p.id === id);

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    const pnl =
      position.side === "LONG"
        ? (currentPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - currentPrice) * position.quantity;

    const margin = (position.entryPrice * position.quantity) / position.leverage;
    const now = Date.now();

    await positionRepository.closePosition(id, pnl, now);

    await tradeLogRepository.logTrade({
      id: `log-${now}`,
      userId,
      positionId: id,
      action: "CLOSE",
      symbol: position.symbol,
      side: position.side,
      price: currentPrice,
      quantity: position.quantity,
      pnl,
      timestamp: now,
    });

    const portfolio = await portfolioRepository.getPortfolio(userId);
    if (portfolio) {
      await portfolioRepository.updateBalance(
        userId,
        portfolio.balance + margin + pnl,
        portfolio.totalPnl + pnl
      );
    }

    return NextResponse.json({
      success: true,
      pnl: Number(pnl.toFixed(2)),
    });
  } catch (error) {
    console.error("POST /api/positions/[id]/close error:", error);
    return NextResponse.json(
      { error: "Failed to close position" },
      { status: 500 }
    );
  }
}