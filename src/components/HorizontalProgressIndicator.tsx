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

  // Calculate progress percentage
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className={cn("horizontal-progress-indicator w-full", className)}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            Tutorial Progress
          </h3>
          {tutorialCompleted && (
            <div className="flex items-center">
              <span className="ml-2 text-xs md:text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Completed
              </span>
              {onResetTutorial && (
                <button
                  onClick={onResetTutorial}
                  className="ml-2 text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  title="Reset Tutorial"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1"
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
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Progress bar - larger and more prominent */}
      <div
        className={cn(
          "relative h-2.5 md:h-3 bg-gray-200 rounded-full overflow-hidden mb-5",
          tutorialCompleted ? "opacity-70" : ""
        )}
      >
        <div
          className="absolute h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Current step description - for very small screens only */}
      <div
        className={cn(
          "flex items-center sm:hidden mb-3",
          tutorialCompleted ? "opacity-60" : ""
        )}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
            bg-yellow-500 border-2 border-yellow-400 ring-2 ring-yellow-100`}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-yellow-600">
            {getStepDescription(steps[currentStep], currentStep)}
          </span>
        </div>
      </div>

      {/* Step indicators with descriptions - grid layout for better alignment */}
      <div
        className={cn(
          "hidden sm:grid grid-cols-6 gap-1 mt-1",
          tutorialCompleted ? "opacity-70" : ""
        )}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex flex-col items-center">
              {/* Step description with fixed height */}
              <div className="h-12 flex items-center justify-center mb-2 w-full px-1">
                <span
                  className={`text-xs md:text-sm text-center line-clamp-2 ${
                    isActive
                      ? "text-blue-700 font-medium"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {getStepDescription(step, index)}
                </span>
              </div>

              {/* Step indicator - larger circles for desktop */}
              <div
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mb-1 ${
                  isActive
                    ? "bg-blue-600 border-2 border-blue-400 ring-1 ring-blue-200"
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
              </div>

              {/* Step number */}
              <span
                className={`text-xs md:text-sm font-medium text-center ${
                  isActive
                    ? "text-blue-700"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Simplified step indicators for very small screens */}
      <div
        className={cn(
          "grid sm:hidden grid-cols-6 gap-1 mt-1",
          tutorialCompleted ? "opacity-70" : ""
        )}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${
                  isActive
                    ? "bg-blue-600 border-2 border-blue-400"
                    : isCompleted
                    ? "bg-green-500 border-2 border-green-400"
                    : "bg-gray-200 border-2 border-gray-300"
                }`}
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
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
              <span
                className={`text-xs font-medium text-center ${
                  isActive
                    ? "text-blue-700"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalProgressIndicator;
