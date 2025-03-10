import React, { useEffect } from "react";
import Terminal from "./Terminal";
import ApiLogs from "./ApiLogs";
import { useApiLogs } from "../contexts/ApiLogsContext";
import { setApiLogsInstance } from "../adamik/getAccountState";
import { cn } from "@/lib/utils";

interface TerminalLayoutProps {
  className?: string;
  welcomeMessage?: string;
  initialCommands?: string[];
}

const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  className,
  welcomeMessage,
  initialCommands,
}) => {
  const apiLogs = useApiLogs();

  // Initialize the API logs instance
  useEffect(() => {
    setApiLogsInstance(apiLogs);
  }, [apiLogs]);

  return (
    <div
      className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 w-full", className)}
    >
      <Terminal
        welcomeMessage={welcomeMessage}
        initialCommands={initialCommands}
        className="h-[80vh]"
      />
      <ApiLogs logs={apiLogs.logs} className="h-[80vh]" />
    </div>
  );
};

export default TerminalLayout;
