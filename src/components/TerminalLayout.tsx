import React, { useEffect, useState } from "react";
import Terminal, { guidedFlowStepsWithDescriptions } from "./Terminal";
import ApiLogs from "./ApiLogs";
import { useApiLogs } from "../contexts/ApiLogsContext";
import { setApiLogsInstance } from "../adamik/apiLogsManager";
import { cn } from "@/lib/utils";
import VerticalProgressIndicator from "./VerticalProgressIndicator";
import HorizontalProgressIndicator from "./HorizontalProgressIndicator";

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
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);

  // Convert the guidedFlowStepsWithDescriptions to the format expected by the progress indicators
  const progressSteps = guidedFlowStepsWithDescriptions.map((item) => ({
    command: item.step,
    description: item.description,
  }));

  // Initialize the API logs instance
  useEffect(() => {
    setApiLogsInstance(apiLogs);
  }, [apiLogs]);

  // Check if tutorial is completed on mount and when currentStep changes
  useEffect(() => {
    const isCompleted = sessionStorage.getItem("tutorialCompleted") === "true";
    setTutorialCompleted(isCompleted);
  }, [currentStep]);

  const handleProgressUpdate = (step: number) => {
    console.log("Progress update:", step);
    setCurrentStep(step);
  };

  return (
    <div className="relative max-w-[1400px] mx-auto">
      {/* Horizontal Progress Indicator for all screen sizes */}
      <div className="mb-2 px-4 md:px-0">
        <HorizontalProgressIndicator
          currentStep={currentStep}
          steps={progressSteps}
          tutorialCompleted={tutorialCompleted}
        />
      </div>

      {/* Main Terminal Container */}
      <div className={cn("w-full mx-auto", className)}>
        {/* Desktop View - Two columns side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Terminal
            onProgressUpdate={handleProgressUpdate}
            className="h-[70vh]"
            welcomeMessage={welcomeMessage}
            initialCommands={initialCommands}
          />
          <ApiLogs logs={apiLogs.logs} className="h-[70vh]" />
        </div>
      </div>
    </div>
  );
};

export default TerminalLayout;
