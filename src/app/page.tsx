"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/application/store/marketStore";
import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { TerminalHeader } from "@/presentation/components/layout/TerminalHeader";
import { WorkspaceTabs } from "@/presentation/components/layout/WorkspaceTabs";
import { Sidebar } from "@/presentation/components/layout/Sidebar";
import { CommandPalette } from "@/presentation/components/layout/CommandPalette";
import { TickerTape } from "@/presentation/components/trading/TickerTape";
import { MarketStats } from "@/presentation/components/trading/MarketStats";
import { ChartPanel } from "@/presentation/components/trading/ChartPanel";
import { OrderBookPanel } from "@/presentation/components/trading/OrderBookPanel";
import { OrderPanel } from "@/presentation/components/trading/OrderPanel";
import { PositionsTable } from "@/presentation/components/trading/PositionsTable";
import { RecentTrades } from "@/presentation/components/trading/RecentTrades";
import { BacktestStudio } from "@/presentation/components/algo/BacktestStudio";
import { RiskDashboard } from "@/presentation/components/analytics/RiskDashboard";
import { SystemLogs } from "@/presentation/components/system/SystemLogs";

export default function Home() {
  const start = useMarketStore((s) => s.start);
  const activeView = useWorkspaceStore((s) => s.activeView);
  const addLog = useWorkspaceStore((s) => s.addLog);

  useEffect(() => {
    start();
    addLog("INFO", "Market engine connected to trading workspace.");
  }, [start, addLog]);

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TerminalHeader />
        <TickerTape />

        <div className="mx-auto max-w-[1600px] w-full p-6 space-y-6">
          <WorkspaceTabs />

          {activeView === "TRADING" && (
            <>
              <MarketStats />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <ChartPanel />
                </div>
                <div className="lg:col-span-1">
                  <OrderBookPanel />
                </div>
                <div className="lg:col-span-1">
                  <OrderPanel />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <PositionsTable />
                </div>
                <div className="lg:col-span-1">
                  <RecentTrades />
                </div>
              </div>
            </>
          )}

          {activeView === "ALGO_STUDIO" && <BacktestStudio />}
          {activeView === "RISK_DASHBOARD" && <RiskDashboard />}
          {activeView === "SYSTEM_LOGS" && <SystemLogs />}
        </div>
      </div>

      <CommandPalette />
    </main>
  );
}