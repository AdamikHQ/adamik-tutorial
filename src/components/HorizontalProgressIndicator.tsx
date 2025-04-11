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
}

const HorizontalProgressIndicator: React.FC<
  HorizontalProgressIndicatorProps
> = ({ currentStep, steps, className, tutorialCompleted = false }) => {
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
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-800">Tutorial Progress</h3>
        <div className="flex items-center">
          <span className="text-xs text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Main container with progress bar and steps */}
      <div className="mb-6">
        <div className="relative h-10">
          {/* Progress bar container - moved to top */}
          <div className="absolute top-0 left-0 w-full h-1.5">
            {/* Background track */}
            <div className="w-full h-full bg-gray-200 rounded-full"></div>

            {/* Progress fill */}
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${
                  currentStep === 0
                    ? 0
                    : (currentStep / (steps.length - 1)) * 100
                }%`,
              }}
            ></div>

            {/* Step circles */}
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              // Calculate the position for each step
              // First step at far left, last step at far right, others evenly distributed
              const leftPosition =
                index === 0
                  ? "0%"
                  : index === steps.length - 1
                  ? "100%"
                  : `${(index / (steps.length - 1)) * 100}%`;

              return (
                <div
                  key={`circle-${index}`}
                  className="absolute -top-[0.3rem]"
                  style={{
                    left: leftPosition,
                    transform:
                      index === 0
                        ? "translateX(0)"
                        : index === steps.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150
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
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step labels - moved below the progress bar */}
          <div className="absolute top-6 left-0 w-full mt-1">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              // Calculate the horizontal position - use the exact same positioning as the circles
              const leftPosition =
                index === 0
                  ? "0%"
                  : index === steps.length - 1
                  ? "100%"
                  : `${(index / (steps.length - 1)) * 100}%`;

              return (
                <div
                  key={`label-${index}`}
                  className="absolute"
                  style={{
                    left: leftPosition,
                    transform:
                      index === 0
                        ? "translateX(0)"
                        : index === steps.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                    width: "5rem",
                    textAlign:
                      index === 0
                        ? "left"
                        : index === steps.length - 1
                        ? "right"
                        : "center",
                  }}
                >
                  <span
                    className={`text-xs transition-colors duration-150 block whitespace-nowrap
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalProgressIndicator;
