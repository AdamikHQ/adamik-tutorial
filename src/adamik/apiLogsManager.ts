import { useApiLogs } from "../contexts/ApiLogsContext";

// Create a singleton instance of the API logs hook
export let apiLogsInstance: ReturnType<typeof useApiLogs> | null = null;

export const setApiLogsInstance = (instance: ReturnType<typeof useApiLogs>) => {
  apiLogsInstance = instance;
};
