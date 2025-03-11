import React, { createContext, useContext, useState, useCallback } from "react";
import { ApiLogEntry } from "../components/ApiLogs";

interface ApiLogsContextType {
  logs: ApiLogEntry[];
  addLog: (log: Omit<ApiLogEntry, "id" | "timestamp">) => number;
  updateLog: (id: number, updates: Partial<ApiLogEntry>) => void;
  clearLogs: () => void;
}

const ApiLogsContext = createContext<ApiLogsContextType | undefined>(undefined);

let nextLogId = 1;

export const ApiLogsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);

  const addLog = useCallback((log: Omit<ApiLogEntry, "id" | "timestamp">) => {
    const id = nextLogId++;
    const newLog: ApiLogEntry = {
      ...log,
      id,
      timestamp: new Date(),
    };

    setLogs((prevLogs) => [...prevLogs, newLog]);
    return id;
  }, []);

  const updateLog = useCallback((id: number, updates: Partial<ApiLogEntry>) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <ApiLogsContext.Provider value={{ logs, addLog, updateLog, clearLogs }}>
      {children}
    </ApiLogsContext.Provider>
  );
};

export const useApiLogs = () => {
  const context = useContext(ApiLogsContext);
  if (context === undefined) {
    throw new Error("useApiLogs must be used within an ApiLogsProvider");
  }
  return context;
};

// Utility functions for common API operations
export const logApiCall = (
  useApiLogsHook: ApiLogsContextType,
  provider: ApiLogEntry["provider"],
  endpoint: string,
  method: ApiLogEntry["method"],
  request?: any,
  operation?: string
) => {
  return useApiLogsHook.addLog({
    provider,
    endpoint,
    method,
    request,
    status: "pending",
    operation,
  });
};

export const logApiResponse = (
  useApiLogsHook: ApiLogsContextType,
  logId: number,
  response: any,
  isError = false
) => {
  useApiLogsHook.updateLog(logId, {
    response,
    status: isError ? "error" : "success",
    message: isError ? response?.message || "Request failed" : undefined,
  });
};
