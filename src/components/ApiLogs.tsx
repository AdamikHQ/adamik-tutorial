import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  operation?: string; // Optional field for operation name
}

interface ApiLogsProps {
  logs: ApiLogEntry[];
  className?: string;
}

const ApiLogs: React.FC<ApiLogsProps> = ({ logs, className }) => {
  const logsRef = useRef<HTMLDivElement>(null);
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});

  // Auto scroll to bottom when new logs are added
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  const getMethodColor = (method: ApiLogEntry["method"]) => {
    switch (method) {
      case "GET":
        return "bg-blue-600";
      case "POST":
        return "bg-green-600";
      case "PUT":
        return "bg-yellow-600";
      case "DELETE":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  // Function to highlight chainId and account address in the endpoint
  const highlightEndpointParts = (endpoint: string) => {
    // Handle SODOT endpoints
    if (endpoint.includes("/sodot-vertex")) {
      // Match pattern like /sodot-vertex-{vertexId}/{curve}/{operation}
      const regex = /\/sodot-vertex-(\d+)\/([^\/]+)\/([^\/]+)/;
      const match = endpoint.match(regex);

      if (match) {
        const [fullMatch, vertexId, curve, operation] = match;
        return (
          <>
            /sodot-vertex-
            <span className="highlight-chain">{vertexId}</span>/
            <span className="highlight-address">{curve}</span>/
            <span className="highlight-operation">{operation}</span>
          </>
        );
      }
    }

    // Match pattern like /api/{chainId}/account/{address}/
    const regex = /\/api\/([^\/]+)\/account\/([^\/]+)\//;
    const match = endpoint.match(regex);

    if (match) {
      const [fullMatch, chainId, address] = match;
      const parts = endpoint.split(fullMatch);

      return (
        <>
          {parts[0]}
          /api/
          <span className="highlight-chain">{chainId}</span>
          /account/
          <span className="highlight-address">{address}</span>/{parts[1]}
        </>
      );
    }

    // Match pattern like /api/{chainId}/transaction/
    const txRegex = /\/api\/([^\/]+)\/transaction\/([^\/]+)/;
    const txMatch = endpoint.match(txRegex);

    if (txMatch) {
      const [fullMatch, chainId, operation] = txMatch;
      return (
        <>
          /api/
          <span className="highlight-chain">{chainId}</span>
          /transaction/
          <span className="highlight-operation">{operation}</span>
        </>
      );
    }

    return endpoint;
  };

  // Function to get a descriptive title for the API call
  const getApiCallDescription = (log: ApiLogEntry) => {
    // If operation is provided, use it
    if (log.operation) {
      return log.operation;
    }

    const { endpoint, method } = log;

    // Handle SODOT API calls
    if (endpoint.includes("/sodot-vertex")) {
      if (endpoint.includes("/derive-pubkey")) {
        return "Derive Public Key";
      }
      if (endpoint.includes("/sign")) {
        return "Sign Transaction";
      }
      if (endpoint.includes("/keygen-init")) {
        return "Initialize Key Generation";
      }
      if (endpoint.includes("/keygen")) {
        return "Generate Key";
      }
      if (endpoint.includes("/create-room")) {
        return "Create Signing Room";
      }
    }

    // Handle Adamik API calls
    if (endpoint.includes("/api/chains") && !endpoint.includes("/chains/")) {
      return "Fetching all blockchain networks";
    }

    if (endpoint.match(/\/api\/chains\/[^\/]+/)) {
      const chainId = endpoint.split("/chains/")[1];
      return `Fetching details for ${chainId} blockchain`;
    }

    if (endpoint.match(/\/api\/[^\/]+\/account\/[^\/]+\/state/)) {
      const parts = endpoint.match(/\/api\/([^\/]+)\/account\/([^\/]+)\/state/);
      if (parts) {
        return `Fetching account state on ${parts[1]}`;
      }
    }

    if (endpoint.includes("/address/encode")) {
      const chainId = endpoint.match(/\/api\/([^\/]+)\/address\/encode/)?.[1];
      return `Converting public key to address on ${chainId}`;
    }

    if (endpoint.includes("/transaction/encode")) {
      return "Encoding transaction";
    }

    if (endpoint.includes("/transaction/broadcast")) {
      return "Broadcasting transaction to network";
    }

    return "API Call";
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
              className={cn(
                "mb-4 p-3 border-l-2 border-gray-700 animate-text-fade-in opacity-0 bg-gray-900/50 rounded api-log-entry",
                expandedLogs[log.id] ? "border-l-blue-500" : ""
              )}
            >
              {/* API Call Description with Method Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold text-white",
                    getMethodColor(log.method)
                  )}
                >
                  {log.method}
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {getApiCallDescription(log)}
                </span>
              </div>

              {/* Basic information - always visible */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn("font-bold", getProviderColor(log.provider))}
                >
                  {log.provider}
                </span>
                <span className="text-xs text-gray-400">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="text-xs text-gray-400 mb-2">
                {highlightEndpointParts(log.endpoint)}
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    getStatusColor(log.status)
                  )}
                >
                  {log.status.toUpperCase()}
                  {log.message ? `: ${log.message}` : ""}
                </div>

                {/* Expand/collapse button */}
                <button
                  onClick={() => toggleExpand(log.id)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                    expandedLogs[log.id]
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-gray-400 hover:text-gray-300"
                  )}
                  aria-label={
                    expandedLogs[log.id] ? "Collapse details" : "Expand details"
                  }
                >
                  {expandedLogs[log.id] ? (
                    <>
                      <ChevronDown size={14} />
                      <span>Hide details</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight size={14} />
                      <span>Show details</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expandable details */}
              {expandedLogs[log.id] && (
                <div className="mt-3 space-y-3 border-t border-gray-700 pt-3">
                  {log.request && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1 font-semibold">
                        Request:
                      </div>
                      <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto text-gray-300">
                        {typeof log.request === "string"
                          ? log.request
                          : JSON.stringify(log.request, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.response && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1 font-semibold">
                        Response:
                      </div>
                      <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto text-gray-300">
                        {typeof log.response === "string"
                          ? log.response
                          : JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
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
