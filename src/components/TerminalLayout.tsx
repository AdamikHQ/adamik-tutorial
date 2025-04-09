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

  const handleResetTutorial = () => {
    // Clear the tutorial completed flag
    sessionStorage.removeItem("tutorialCompleted");
    setTutorialCompleted(false);

    // Reset the current step
    setCurrentStep(0);

    // Reset the workflow state by refreshing the page
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Tutorial Progress Indicator - positioned absolutely to the left (desktop and larger laptops) */}
      <div className="hidden lg:block absolute left-[-10rem] xl:left-[-12rem] 2xl:left-[-13rem] top-6 w-40 xl:w-44 2xl:w-48">
        <div className="sticky top-6">
          <VerticalProgressIndicator
            currentStep={currentStep}
            steps={progressSteps}
            tutorialCompleted={tutorialCompleted}
            onResetTutorial={handleResetTutorial}
          />
        </div>
      </div>

      {/* Main content container */}
      <div className="flex flex-col">
        {/* Horizontal Progress Indicator for mobile and smaller screens */}
        <div className="lg:hidden mb-6 px-4 md:px-6">
          <HorizontalProgressIndicator
            currentStep={currentStep}
            steps={progressSteps}
            tutorialCompleted={tutorialCompleted}
            onResetTutorial={handleResetTutorial}
          />
        </div>

        {/* Main Terminal Container */}
        <div className={cn("w-full mx-auto", className)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Terminal
              onProgressUpdate={handleProgressUpdate}
              className="h-[80vh]"
              welcomeMessage={welcomeMessage}
              initialCommands={initialCommands}
            />
            <ApiLogs logs={apiLogs.logs} className="h-[80vh]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalLayout;
