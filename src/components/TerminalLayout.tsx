import React, { useEffect, useState } from "react";
import Terminal, { guidedFlowSteps } from "./Terminal";
import ApiLogs from "./ApiLogs";
import { useApiLogs } from "../contexts/ApiLogsContext";
import { setApiLogsInstance } from "../adamik/apiLogsManager";
import { cn } from "@/lib/utils";
import VerticalProgressIndicator from "./VerticalProgressIndicator";

interface TerminalLayoutProps {
  className?: string;
  welcomeMessage?: React.ReactNode;
  initialCommands?: string[];
}

const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  className,
  welcomeMessage,
  initialCommands,
}) => {
  const apiLogs = useApiLogs();
  const [currentStep, setCurrentStep] = useState(0);

  // Initialize the API logs instance
  useEffect(() => {
    setApiLogsInstance(apiLogs);
  }, [apiLogs]);

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-start w-full max-w-[1600px] mx-auto px-4 md:px-6 py-4",
        className
      )}
    >
      {/* Vertical Progress Indicator - positioned outside the terminal structure */}
      <div className="hidden md:block w-44 lg:w-48 pr-4 self-start sticky top-6 mb-6 md:mb-0">
        <VerticalProgressIndicator
          currentStep={currentStep}
          steps={guidedFlowSteps}
        />
      </div>

      {/* Terminal and API Logs - full width container */}
      <div className="flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Terminal
            welcomeMessage={welcomeMessage}
            initialCommands={initialCommands}
            className="h-[80vh]"
            onProgressUpdate={setCurrentStep}
          />
          <ApiLogs logs={apiLogs.logs} className="h-[80vh]" />
        </div>
      </div>
    </div>
  );
};

export default TerminalLayout;
