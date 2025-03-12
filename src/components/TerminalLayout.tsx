import React, { useEffect, useState } from "react";
import Terminal, { guidedFlowStepsWithDescriptions } from "./Terminal";
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

  // Handle progress updates from the Terminal component
  const handleProgressUpdate = (step: number) => {
    console.log("Progress update:", step);
    setCurrentStep(step);
  };

  return (
    <div className="relative">
      {/* Tutorial Progress Indicator - positioned absolutely to the left */}
      <div className="hidden md:block absolute left-[-12rem] lg:left-[-13rem] top-6 w-44 lg:w-48">
        <div className="sticky top-6">
          <VerticalProgressIndicator
            currentStep={currentStep}
            steps={guidedFlowStepsWithDescriptions}
          />
        </div>
      </div>

      {/* Main Terminal Container - full width */}
      <div className={cn("w-full mx-auto", className)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Terminal
            welcomeMessage={welcomeMessage}
            initialCommands={initialCommands}
            className="h-[80vh]"
            onProgressUpdate={handleProgressUpdate}
          />
          <ApiLogs logs={apiLogs.logs} className="h-[80vh]" />
        </div>
      </div>
    </div>
  );
};

export default TerminalLayout;
