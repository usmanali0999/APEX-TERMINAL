"use client";

import { useWorkspaceStore } from "@/application/store/workspaceStore";
import { LogLevel } from "@/domain/models/types";

const levelClasses: Record<LogLevel, string> = {
  INFO: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  TRADE: "bg-green-500/10 text-green-300 border-green-500/20",
  ALGO: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  WARN: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  ERROR: "bg-red-500/10 text-red-300 border-red-500/20",
};

export function SystemLogs() {
  const logs = useWorkspaceStore((state) => state.logs);
  const clearLogs = useWorkspaceStore((state) => state.clearLogs);

  return (
    <div className="rounded-xl border border-gray-900 bg-gray-950 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400 font-mono">System & Execution Logs</div>
        <button
          onClick={clearLogs}
          className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 font-mono hover:text-white"
        >
          Clear Logs
        </button>
      </div>

      <div className="space-y-2 max-h-[700px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-sm text-gray-500 font-mono">No logs available.</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-gray-900 bg-black p-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-1 rounded-md text-[10px] border font-mono ${levelClasses[log.level]}`}
                >
                  {log.level}
                </span>
                <div className="text-sm text-gray-200 font-mono">{log.message}</div>
              </div>

              <div className="text-xs text-gray-500 font-mono">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}