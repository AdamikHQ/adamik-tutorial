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
  tutorialCompleted?: boolean;
  onResetTutorial?: () => void;
}

const VerticalProgressIndicator: React.FC<VerticalProgressIndicatorProps> = ({
  currentStep,
  steps,
  className,
  tutorialCompleted = false,
  onResetTutorial,
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Tutorial Progress
        </h3>
        {tutorialCompleted && (
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            Completed
          </span>
        )}
      </div>

      {/* Reset button - only show when tutorial is completed */}
      {tutorialCompleted && onResetTutorial && (
        <button
          onClick={onResetTutorial}
          className="w-full mb-4 py-2 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset Tutorial
        </button>
      )}

      {/* Steps container */}
      <div className={cn("space-y-6", tutorialCompleted ? "opacity-60" : "")}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-start">
              {/* Step indicator */}
              <div
                className={`relative flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                  isActive
                    ? "bg-yellow-500 border-2 border-yellow-400"
                    : isCompleted
                    ? "bg-green-500 border-2 border-green-400"
                    : "bg-gray-200 border-2 border-gray-300"
                }`}
              >
                {isCompleted && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
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
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
                {!isActive && !isCompleted && (
                  <span className="text-xs text-gray-500">{index + 1}</span>
                )}

                {/* Connector line to next step */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-0.5 h-6 -translate-x-1/2 ${
                      index < currentStep
                        ? "bg-green-500"
                        : index === currentStep
                        ? "bg-yellow-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>

              {/* Step content */}
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
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
          );
        })}
      </div>
    </div>
  );
};

export default VerticalProgressIndicator;
