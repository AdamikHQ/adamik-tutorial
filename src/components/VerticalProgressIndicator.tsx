import React from "react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  command: string;
  description: string;
}

interface VerticalProgressIndicatorProps {
  currentStep: number;
  steps: ProgressStep[];
  className?: string;
}

const VerticalProgressIndicator: React.FC<VerticalProgressIndicatorProps> = ({
  currentStep,
  steps,
  className,
}) => {
  return (
    <div
      className={cn(
        "vertical-progress-indicator rounded-lg bg-white shadow-sm border border-gray-200 p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        Tutorial Progress
      </h3>
      <div className="flex flex-col space-y-6 relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gray-200"></div>

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-start relative z-10">
              {/* Circle indicator */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                  isActive
                    ? "bg-yellow-500 border-2 border-yellow-400 ring-2 ring-yellow-100"
                    : isCompleted
                    ? "bg-green-500 border-2 border-green-400"
                    : "bg-gray-100 border-2 border-gray-200"
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

              {/* Step description */}
              <div className="flex flex-col">
                <span
                  className={`text-xs font-semibold ${
                    isActive
                      ? "text-yellow-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Step {index + 1}
                </span>
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-yellow-600 font-medium"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.description}
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
