import React from "react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  command: string;
  description: string;
}

interface HorizontalProgressIndicatorProps {
  currentStep: number;
  steps: ProgressStep[] | string[];
  className?: string;
  tutorialCompleted?: boolean;
  onResetTutorial?: () => void;
}

const HorizontalProgressIndicator: React.FC<
  HorizontalProgressIndicatorProps
> = ({
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
    <div className={cn("horizontal-progress-indicator w-full", className)}>
      {/* Header with title and status */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-medium text-gray-800">
          Tutorial Progress
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          {tutorialCompleted && onResetTutorial && (
            <button
              onClick={onResetTutorial}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main container for progress bar and labels */}
      <div className="mb-10">
        {/* Create step points with indicators and labels in a single component for perfect alignment */}
        <div className="relative">
          {/* Background track */}
          <div className="h-1 md:h-1.5 bg-gray-200 rounded-full"></div>

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-1 md:h-1.5 bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width:
                currentStep === 0
                  ? "0%"
                  : `calc(${currentStep} * (100% / ${steps.length - 1}))`,
            }}
          ></div>

          {/* Steps with indicators and labels */}
          <div className="absolute top-0 inset-x-0 flex justify-between -mt-[4px] md:-mt-[6px]">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={`step-${index}`}
                  className="flex flex-col items-center"
                  style={{
                    // For first and last steps, adjust position slightly
                    marginLeft: index === 0 ? "-2px" : "0",
                    marginRight: index === steps.length - 1 ? "-2px" : "0",
                    width: `${100 / steps.length}%`,
                    maxWidth: "100px",
                  }}
                >
                  {/* Step indicator */}
                  <div
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150
                      ${
                        isActive
                          ? "bg-blue-600 border-white ring-2 ring-blue-500"
                          : isCompleted
                          ? "bg-green-500 border-white"
                          : "bg-white border-gray-300"
                      }`}
                    aria-label={`${getStepDescription(step, index)} (Step ${
                      index + 1
                    } of ${steps.length})`}
                  >
                    {isCompleted && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2.5 w-2.5 text-white"
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
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Step label - perfectly centered below each indicator */}
                  <div className="mt-1 text-center w-full">
                    <span
                      className={`text-xs md:text-sm text-center transition-colors duration-150 line-clamp-1 
                        ${
                          isActive
                            ? "text-blue-700 font-medium"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {getStepDescription(step, index)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalProgressIndicator;
