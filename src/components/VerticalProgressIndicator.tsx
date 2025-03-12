import React from "react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  command: string;
  description: string;
}

interface VerticalProgressIndicatorProps {
  currentStep: number;
  steps: ProgressStep[] | string[];
  className?: string;
}

const VerticalProgressIndicator: React.FC<VerticalProgressIndicatorProps> = ({
  currentStep,
  steps,
  className,
}) => {
  // Helper function to get step description
  const getStepDescription = (
    step: ProgressStep | string,
    index: number
  ): string => {
    if (typeof step === "string") {
      return step;
    }
    return step.description;
  };

  return (
    <div className={cn("vertical-progress-indicator", className)}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Tutorial Progress
      </h3>
      <div className="flex flex-col space-y-4 lg:space-y-5 relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gray-300"></div>

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-start relative z-10">
              {/* Circle indicator */}
              <div
                className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center mr-2 ${
                  isActive
                    ? "bg-yellow-500 border-2 border-yellow-400 ring-1 ring-yellow-100"
                    : isCompleted
                    ? "bg-green-500 border-2 border-green-400"
                    : "bg-gray-200 border-2 border-gray-300"
                }`}
              >
                {isCompleted && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isActive && (
                  <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full"></div>
                )}
              </div>

              {/* Step description */}
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span
                    className={`text-xs font-semibold ${
                      isActive
                        ? "text-yellow-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {index + 1}.
                  </span>
                  <span
                    className={`text-xs ml-1 font-medium ${
                      isActive
                        ? "text-yellow-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {getStepDescription(step, index)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalProgressIndicator;
