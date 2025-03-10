import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ApiLogEntry {
  id: number;
  timestamp: Date;
  provider: "Adamik" | "Sodot" | "System";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  request?: any;
  response?: any;
  status: "pending" | "success" | "error";
  message?: string;
}

interface ApiLogsProps {
  logs: ApiLogEntry[];
  className?: string;
}

const ApiLogs: React.FC<ApiLogsProps> = ({ logs, className }) => {
  const logsRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs are added
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusColor = (status: ApiLogEntry["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getProviderColor = (provider: ApiLogEntry["provider"]) => {
    switch (provider) {
      case "Adamik":
        return "text-blue-400";
      case "Sodot":
        return "text-purple-400";
      case "System":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className={cn(
        "terminal-window flex flex-col w-full h-full max-h-[80vh]",
        className
      )}
    >
      <div className="terminal-header flex items-center gap-2 px-4 py-3">
        <div className="terminal-button bg-red-500"></div>
        <div className="terminal-button bg-yellow-500"></div>
        <div className="terminal-button bg-green-500"></div>
        <div className="ml-4 text-xs text-gray-400 flex-1 text-center">
          API Logs
        </div>
      </div>

      <div
        ref={logsRef}
        className="terminal-content flex-1 p-4 overflow-y-auto"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No API calls recorded yet. Interact with the terminal to see logs.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="mb-4 p-3 border-l-2 border-gray-700 animate-text-fade-in opacity-0"
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn("font-bold", getProviderColor(log.provider))}
                >
                  {log.provider}
                </span>
                <span className="text-xs text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400 font-mono text-sm">
                  {log.method}
                </span>
                <span className="text-gray-300 font-mono text-sm break-all">
                  {log.endpoint}
                </span>
              </div>

              <div className={cn("text-sm", getStatusColor(log.status))}>
                {log.status.toUpperCase()}
                {log.message ? `: ${log.message}` : ""}
              </div>

              {log.request && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Request:</div>
                  <pre className="bg-black p-2 rounded text-xs overflow-x-auto">
                    {typeof log.request === "string"
                      ? log.request
                      : JSON.stringify(log.request, null, 2)}
                  </pre>
                </div>
              )}

              {log.response && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Response:</div>
                  <pre className="bg-black p-2 rounded text-xs overflow-x-auto">
                    {typeof log.response === "string"
                      ? log.response
                      : JSON.stringify(log.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApiLogs;
