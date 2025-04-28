import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Cpu,
  Key,
  Lock,
  Shield,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface ApiLogEntry {
  id: number;
  timestamp: Date;
  provider: "Adamik" | "Signer" | "System";
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
      case "Signer":
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

  // Function to get the appropriate icon for operation type
  const getOperationIcon = (log: ApiLogEntry) => {
    const description = getApiCallDescription(log);

    if (description === "Retrieving Public Key") {
      return <Key size={16} className="text-yellow-400" />;
    }
    if (description === "Signing Transaction") {
      return <Lock size={16} className="text-green-400" />;
    }
    if (
      description.includes("Setting up") ||
      description.includes("Initializing") ||
      description.includes("Generating")
    ) {
      return <Shield size={16} className="text-blue-400" />;
    }

    return <Cpu size={16} className="text-gray-400" />;
  };

  // Function to get a descriptive title for the API call
  const getApiCallDescription = (log: ApiLogEntry) => {
    // If operation is provided, use it
    if (log.operation) {
      return log.operation;
    }

    const { endpoint, method } = log;

    // Handle Signer API calls
    if (endpoint.includes("/sodot-vertex")) {
      if (endpoint.includes("/derive-pubkey")) {
        return "Retrieving Public Key";
      }
      if (endpoint.includes("/sign")) {
        return "Signing Transaction";
      }
      if (endpoint.includes("/keygen-init")) {
        return "Initializing Key Generation";
      }
      if (endpoint.includes("/keygen")) {
        return "Generating Secure Key";
      }
      if (endpoint.includes("/create-room")) {
        return "Setting up Secure Signing Environment";
      }
    }

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

  // Filter and deduplicate logs
  const filteredLogs = React.useMemo(() => {
    // Track the logs to keep
    const result: ApiLogEntry[] = [];
    const setupOperationIds = new Set<number>();

    // Group signing operations by their approximate timestamp (7-second windows)
    // This ensures different sign-tx commands are preserved
    const signingGroups: Record<string, ApiLogEntry[]> = {};

    // First pass: Group signing logs by time and mark setup logs
    logs.forEach((log) => {
      // Replace any "Sodot" provider text that might be displayed
      if (log.provider === "Signer" && log.endpoint.includes("/sodot-vertex")) {
        // Create a shallow copy of the log to avoid mutating the original
        const updatedLog = { ...log };

        // This will be shown as "Secure Signer" instead of Sodot
        if (updatedLog.message === "Sodot") {
          updatedLog.message = "";
        }

        log = updatedLog;
      }

      const description = getApiCallDescription(log);

      // Group signing operations by timestamp
      if (description === "Signing Transaction") {
        // Create 7-second window identifier
        const timeWindow = Math.floor(log.timestamp.getTime() / (1000 * 7));
        const groupKey = `sign-${timeWindow}`;

        if (!signingGroups[groupKey]) {
          signingGroups[groupKey] = [];
        }
        signingGroups[groupKey].push(log);
      }

      // Skip setup logs entirely
      if (description === "Setting up Secure Signing Environment") {
        setupOperationIds.add(log.id);
      }
    });

    // Find the best log from each signing group
    const bestSigningLogs = new Set<number>();
    Object.values(signingGroups).forEach((group) => {
      // Choose the best log from this group (prefer the one with simple signature format)
      let bestLog = group[0];
      for (const log of group) {
        if (
          log.response &&
          typeof log.response === "object" &&
          "signature" in log.response
        ) {
          bestLog = log;
          break;
        }
      }
      bestSigningLogs.add(bestLog.id);
    });

    // Second pass: Build result array
    logs.forEach((log) => {
      // For signing logs, only include the best one from each time window
      if (getApiCallDescription(log) === "Signing Transaction") {
        if (!bestSigningLogs.has(log.id)) {
          return;
        }
      }

      // Skip setup logs
      if (setupOperationIds.has(log.id)) {
        return;
      }

      // Keep this log
      result.push(log);
    });

    return result;
  }, [logs]);

  // Auto scroll to bottom when new logs are added
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Function to highlight chainId and account address in the endpoint
  const highlightEndpointParts = (endpoint: string) => {
    // Handle Signer endpoints
    if (endpoint.includes("/sodot-vertex")) {
      // Match pattern like /sodot-vertex-{vertexId}/{curve}/{operation}
      const regex = /\/sodot-vertex-(\d+)\/([^\/]+)\/([^\/]+)/;
      const match = endpoint.match(regex);

      if (match) {
        const [fullMatch, vertexId, curve, operation] = match;
        return (
          <>
            /secure-mpc-
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
          API & MPC Operations
        </div>
      </div>

      <div
        ref={logsRef}
        className="terminal-content flex-1 p-4 overflow-y-auto"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No operations recorded yet. Interact with the terminal to see logs.
          </div>
        ) : (
          filteredLogs.map((log) => {
            // Make a shallow copy of the log to display correctly
            const displayLog = { ...log } as ApiLogEntry & { provider: string };
            if (log.endpoint.includes("/sodot-vertex")) {
              // Replace any "Sodot" text in the log values that might still appear
              if ((displayLog as any).provider === "Sodot") {
                displayLog.provider = "Signer";
              }
            }

            return (
              <div
                key={log.id}
                className={cn(
                  "mb-4 p-3 border-l-2 border-gray-700 animate-text-fade-in opacity-0 bg-gray-900/50 rounded api-log-entry",
                  expandedLogs[log.id] ? "border-l-blue-500" : ""
                )}
              >
                {/* API Call Description with Method Badge and Operation Icon */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold text-white",
                      getMethodColor(displayLog.method)
                    )}
                  >
                    {displayLog.method}
                  </span>
                  {displayLog.provider === "Signer" ? (
                    <div className="flex items-center gap-1.5">
                      {getOperationIcon(displayLog)}
                      <span className="text-sm font-medium text-gray-200">
                        {getApiCallDescription(displayLog)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-200">
                      {getApiCallDescription(displayLog)}
                    </span>
                  )}
                  {displayLog.provider === "Signer" && (
                    <span className="ml-2 text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                      Secure MPC
                    </span>
                  )}
                </div>

                {/* Basic information - always visible */}
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={cn(
                      "font-bold",
                      getProviderColor(displayLog.provider)
                    )}
                  >
                    {displayLog.provider === "Signer"
                      ? "Secure Signer"
                      : displayLog.provider}
                  </span>
                  <span className="text-xs text-gray-400">
                    {displayLog.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  {highlightEndpointParts(displayLog.endpoint)}
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      getStatusColor(displayLog.status)
                    )}
                  >
                    {displayLog.status.toUpperCase()}
                    {displayLog.message ? `: ${displayLog.message}` : ""}
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
                      expandedLogs[log.id] ? "Hide details" : "Show details"
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
                    {displayLog.request && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1 font-semibold">
                          Request:
                        </div>
                        <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto text-gray-300">
                          {typeof displayLog.request === "string"
                            ? displayLog.request
                            : JSON.stringify(displayLog.request, null, 2)}
                        </pre>
                      </div>
                    )}

                    {displayLog.response && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1 font-semibold">
                          Response:
                        </div>
                        <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto text-gray-300">
                          {typeof displayLog.response === "string"
                            ? displayLog.response
                            : JSON.stringify(displayLog.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApiLogs;
