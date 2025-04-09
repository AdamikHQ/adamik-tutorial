import React, { useState, useRef, useEffect, useCallback } from "react";
import CommandLine from "./CommandLine";
import TerminalOutput from "./TerminalOutput";
import { executeCommand } from "../utils/terminalCommands";
import { cn } from "@/lib/utils";
import { useApiLogs } from "../contexts/ApiLogsContext";
import { DEFAULT_WELCOME_MESSAGE } from "../constants/messages";
import SodotConfigStatus from "./SodotConfigStatus";
import { showroomChains } from "../utils/showroomChains";
import { workflowState, isTutorialCompleted } from "../utils/terminalTypes";

interface TerminalProps {
  className?: string;
  welcomeMessage?: React.ReactNode;
  initialCommands?: string[];
  onProgressUpdate?: (currentStep: number) => void;
}

interface CommandEntry {
  id: number | string;
  command: string;
  output: React.ReactNode;
  type: "success" | "error" | "info";
}

// Define the complete flow with commands and descriptions
export const guidedFlowStepsWithDescriptions = [
  { step: "start", description: "Start tutorial" },
  { step: "chain-selection", description: "Select chain" },
  { step: "prepare-tx", description: "Prepare tx" },
  { step: "sign-tx", description: "Sign tx" },
  { step: "broadcast-tx", description: "Broadcast tx" },
  { step: "explore-chains", description: "Explore chains" },
];

// Derive the simple array of step descriptions when needed
export const guidedFlowSteps = guidedFlowStepsWithDescriptions.map(
  (step) => step.description
);

const Terminal = ({
  className,
  welcomeMessage = DEFAULT_WELCOME_MESSAGE,
  initialCommands = [],
  onProgressUpdate,
}: TerminalProps) => {
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandCount = useRef<number>(0);
  const apiLogs = useApiLogs();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(true);
  const [suggestedCommand, setSuggestedCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [signerConfigChecked, setSignerConfigChecked] =
    useState<boolean>(false);
  const [currentFlowStep, setCurrentFlowStep] = useState<number>(0); // Start is the current step (yellow)
  const [isProcessingCommand, setIsProcessingCommand] =
    useState<boolean>(false); // Track if a command is processing
  const [isTutorialDone, setIsTutorialDone] = useState<boolean>(false);
  const lastUpdateRef = useRef<number>(Date.now()); // Track when the last update happened

  // Create a custom setCommandHistory function that also triggers scrolling
  const updateCommandHistory = (
    updater: React.SetStateAction<CommandEntry[]>
  ) => {
    setCommandHistory(updater);
    lastUpdateRef.current = Date.now();

    // Schedule a scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 0);
  };

  // Check if tutorial is completed
  useEffect(() => {
    const checkTutorialStatus = () => {
      const completed = isTutorialCompleted();
      setIsTutorialDone(completed);
    };

    // Check on mount and whenever a command is processed
    checkTutorialStatus();

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      checkTutorialStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [commandHistory]);

  // Notify parent component when progress changes
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(currentFlowStep);
    }
  }, [currentFlowStep, onProgressUpdate]);

  // Process initial commands on mount
  useEffect(() => {
    // Reset the helpExecuted flag when the component mounts
    sessionStorage.removeItem("helpExecuted");

    if (initialCommands.length > 0 && signerConfigChecked) {
      const delay = 500; // delay between commands in ms

      initialCommands.forEach((cmd, index) => {
        setTimeout(() => {
          handleCommandExecution(cmd);
        }, delay * (index + 1));
      });
    }
  }, [initialCommands, signerConfigChecked]);

  // Enhanced auto scroll to bottom when new content is added
  useEffect(() => {
    // Function to scroll to bottom
    const scrollToBottom = () => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    };

    // Scroll immediately when command history changes
    scrollToBottom();

    // Set up an interval to check for updates during command processing
    let intervalId: number | undefined;

    if (isProcessingCommand) {
      intervalId = window.setInterval(() => {
        // Only scroll if there was a recent update
        if (Date.now() - lastUpdateRef.current < 500) {
          scrollToBottom();
        }
      }, 100);
    }

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [commandHistory, signerConfigChecked, isProcessingCommand]);

  // Focus input on mount and when clicking terminal
  useEffect(() => {
    if (signerConfigChecked) {
      inputRef.current?.focus();
    }
  }, [signerConfigChecked]);

  // Define the guided flow commands (with special case for chain selection)
  const guidedFlow = [
    guidedFlowStepsWithDescriptions[0].step.toLowerCase(), // start
    "optimism", // Default chain, but any chain selection should continue the flow
    guidedFlowStepsWithDescriptions[2].step.toLowerCase(), // prepare-tx
    guidedFlowStepsWithDescriptions[3].step.toLowerCase(), // sign-tx
    guidedFlowStepsWithDescriptions[4].step.toLowerCase(), // broadcast-tx
    guidedFlowStepsWithDescriptions[5].step.toLowerCase(), // explore-chains
  ];

  // Determine the next suggested command based on command history
  useEffect(() => {
    if (commandHistory.length === 0) {
      setSuggestedCommand("start");
      setCurrentFlowStep(0); // Start is the current step (yellow)
      return;
    }

    const lastCommand = commandHistory[commandHistory.length - 1].command;
    const lastOutput = commandHistory[commandHistory.length - 1].output;
    const lastType = commandHistory[commandHistory.length - 1].type;

    // Don't update flow step for commands that are still processing
    if (
      lastOutput &&
      typeof lastOutput === "object" &&
      React.isValidElement(lastOutput) &&
      lastOutput.props?.children === "Processing command..."
    ) {
      return;
    }

    // Helper function to update suggested command and flow step together
    const updateSuggestion = (command: string, flowStep: number) => {
      setSuggestedCommand(command);

      // Normalize the command for case-insensitive comparison
      const normalizedCommand = command.toLowerCase();
      const normalizedLastCommand = lastCommand.toLowerCase();

      // Only update the flow step if it's not a regression (going back to a lower step)
      // unless it's a clear command or we're starting over
      if (
        flowStep >= currentFlowStep ||
        normalizedCommand === "start" ||
        normalizedLastCommand === "clear" ||
        normalizedLastCommand === "broadcast-tx"
      ) {
        setCurrentFlowStep(flowStep);
      }
    };

    // Check if the last command was a chain selection - use direct check with showroomChains
    let isChainSelection = Object.keys(showroomChains).some(
      (chainId) => chainId.toLowerCase() === lastCommand.toLowerCase()
    );

    // Also check if we're in chain selection mode from the lastCommandResult
    const lastCommandResultJson = sessionStorage.getItem("lastCommandResult");
    const inChainSelectionMode = lastCommandResultJson
      ? JSON.parse(lastCommandResultJson).chainSelection === true
      : false;

    // Check if the last output contains chain details, which would indicate
    // a successful chain selection
    const hasChainDetails =
      lastOutput &&
      typeof lastOutput === "object" &&
      React.isValidElement(lastOutput) &&
      lastOutput.props?.children?.some?.((child) =>
        child?.props?.children?.some?.(
          (grandchild) =>
            typeof grandchild === "string" &&
            (grandchild.includes("Address for") ||
              grandchild.includes("Account Information"))
        )
      );

    // Find the current position in the guided flow
    // Normalize lastCommand for case-insensitive comparison
    const normalizedLastCommand = lastCommand.toLowerCase();
    let currentIndex = guidedFlow.indexOf(normalizedLastCommand);

    // If the last command was a chain selection, find the index of the default chain
    // in the guided flow and use that as the current index
    if (isChainSelection && hasChainDetails) {
      currentIndex = guidedFlow.indexOf("optimism");
      // Chain selection completed, next is prepare-tx (step 2)
      updateSuggestion("prepare-tx", 2); // prepare-tx is the current step (yellow)
      return; // Exit early to prevent other logic from overriding
    }

    // Special case handling
    if (normalizedLastCommand === "clear") {
      // If user cleared the terminal, suggest starting again
      updateSuggestion("start", 0); // Start is the current step (yellow)
    } else if (normalizedLastCommand === "help") {
      // After help command, suggest start as the next action
      updateSuggestion("start", 0); // Start is the current step (yellow)
    } else if (normalizedLastCommand === "explore-chains") {
      // After completing the flow with explore-chains, suggest starting a new cycle
      updateSuggestion("start", 0); // Start is the current step (yellow)
    } else if (normalizedLastCommand === "broadcast-tx") {
      // After broadcast-tx, suggest explore-chains
      updateSuggestion("explore-chains", 5); // explore-chains is the current step (yellow)
    } else if (
      normalizedLastCommand === "prepare-tx" &&
      lastType === "success"
    ) {
      // After prepare-tx, suggest sign-tx
      updateSuggestion("sign-tx", 3); // sign-tx is the current step (yellow)
    } else if (normalizedLastCommand === "sign-tx" && lastType === "success") {
      // After sign-tx, suggest broadcast-tx
      updateSuggestion("broadcast-tx", 4); // broadcast-tx is the current step (yellow)
    } else if (
      Object.keys(showroomChains).some(
        (chainId) => chainId.toLowerCase() === lastCommand.toLowerCase()
      ) &&
      lastType === "success"
    ) {
      // After successful chain selection, suggest prepare-tx
      updateSuggestion("prepare-tx", 2); // prepare-tx is the current step (yellow)
    } else if (hasChainDetails) {
      // If the output shows chain details, suggest prepare-tx
      updateSuggestion("prepare-tx", 2); // prepare-tx is the current step (yellow)
    } else if (
      Object.keys(showroomChains).some(
        (chainId) => chainId.toLowerCase() === lastCommand.toLowerCase()
      ) &&
      !hasChainDetails
    ) {
      // Chain selection in progress, but not completed yet
      // Keep the current suggestion (which should be the chain selection)
      updateSuggestion("", 1); // Chain selection is the current step (yellow)
    } else if (normalizedLastCommand === "start" && lastType === "success") {
      // After start command, suggest chain selection
      // We'll suggest optimism as a default chain
      updateSuggestion("optimism", 1); // Chain selection is the current step (yellow)
    } else if (inChainSelectionMode) {
      // If we're in chain selection mode but the last command wasn't a valid chain
      // Keep suggesting chain selection
      updateSuggestion("optimism", 1); // Chain selection is the current step (yellow)
    } else if (currentIndex >= 0 && currentIndex < guidedFlow.length - 1) {
      // If the last command is in our flow and not the last step, suggest the next one
      const nextCommand = guidedFlow[currentIndex + 1];
      let nextFlowStep = currentFlowStep; // Keep the current flow step by default

      // Update the flow step based on the last command
      if (normalizedLastCommand === "start" && lastType === "success") {
        nextFlowStep = 1; // Chain selection is the current step (yellow)
      } else if (
        normalizedLastCommand === "prepare-tx" &&
        lastType === "success"
      ) {
        nextFlowStep = 3; // Sign-tx is the current step (yellow)
      } else if (
        normalizedLastCommand === "sign-tx" &&
        lastType === "success"
      ) {
        nextFlowStep = 4; // Broadcast-tx is the current step (yellow)
      }

      updateSuggestion(nextCommand, nextFlowStep);
    } else {
      // Default suggestion for any other command
      // Don't change the flow step here to prevent resetting
      setSuggestedCommand("start");
    }
  }, [commandHistory, currentFlowStep]);

  // Update the current flow step based on the command
  const updateCurrentFlowStep = (command: string) => {
    let newStep = currentFlowStep;

    // Normalize the command to lowercase for case-insensitive comparison
    const normalizedCommand = command.toLowerCase();

    // Determine the step based on the command
    if (normalizedCommand === "start") {
      newStep = 0; // Start step
    } else if (
      Object.keys(showroomChains).some(
        (chainId) => chainId.toLowerCase() === normalizedCommand
      )
    ) {
      newStep = 1; // Chain selection step
    } else if (normalizedCommand === "prepare-tx") {
      newStep = 2; // Prepare transaction step
    } else if (normalizedCommand === "sign-tx") {
      newStep = 3; // Sign transaction step
    } else if (normalizedCommand === "broadcast-tx") {
      newStep = 4; // Broadcast transaction step
    } else if (normalizedCommand === "explore-chains") {
      // Only set to step 5 if the user has completed the previous steps
      if (workflowState.txHash) {
        newStep = 5; // Explore chains step (final step in guided flow)
      } else {
        // If the user hasn't completed the previous steps, reset to step 0
        newStep = 0;
      }
    }

    // Only update if the step has changed and is not a regression (going back to a lower step)
    // unless it's a clear command or we're starting over
    if (
      newStep !== currentFlowStep &&
      (newStep >= currentFlowStep ||
        normalizedCommand === "clear" ||
        normalizedCommand === "start" ||
        (normalizedCommand === "explore-chains" && !workflowState.txHash))
    ) {
      setCurrentFlowStep(newStep);
      // Call the onProgressUpdate callback if provided
      if (onProgressUpdate) {
        onProgressUpdate(newStep);
      }
    }
  };

  const handleCommandExecution = async (command: string) => {
    if (!command.trim()) return;

    // Hide welcome message for all commands
    setShowWelcomeMessage(false);

    // Set processing state to true
    setIsProcessingCommand(true);

    const id = commandCount.current++;

    // Normalize command for case-insensitive comparison
    const normalizedCommand = command.trim().toLowerCase();

    // For clear command, we don't need progressive updates
    if (normalizedCommand === "clear") {
      const result = await executeCommand(command);

      if (result.clearTerminal) {
        // Clear the API logs if the clear command is executed
        apiLogs.clearLogs();
        setShowWelcomeMessage(true); // Show the welcome message again after clear

        // Clear the terminal history but preserve the output from the clear command
        updateCommandHistory([
          {
            id,
            command,
            output: result.output,
            type: result.success ? "success" : result.type || "error",
          },
        ]);

        // Reset the flow step to 0 (start)
        setCurrentFlowStep(0);
        if (onProgressUpdate) {
          onProgressUpdate(0);
        }
      }

      // Set processing state to false
      setIsProcessingCommand(false);
    } else {
      // Immediately update the flow step based on the command being executed
      // This ensures the progress indicator updates right after the user presses enter
      if (normalizedCommand === "start") {
        setCurrentFlowStep(0);
        if (onProgressUpdate) {
          onProgressUpdate(0);
        }
      } else if (
        Object.keys(showroomChains).some(
          (chainId) => chainId.toLowerCase() === normalizedCommand
        )
      ) {
        setCurrentFlowStep(1);
        if (onProgressUpdate) {
          onProgressUpdate(1);
        }
      } else if (normalizedCommand === "prepare-tx") {
        setCurrentFlowStep(2);
        if (onProgressUpdate) {
          onProgressUpdate(2);
        }
      } else if (normalizedCommand === "sign-tx") {
        setCurrentFlowStep(3);
        if (onProgressUpdate) {
          onProgressUpdate(3);
        }
      } else if (normalizedCommand === "broadcast-tx") {
        setCurrentFlowStep(4);
        if (onProgressUpdate) {
          onProgressUpdate(4);
        }
      } else if (normalizedCommand === "explore-chains") {
        // Only set to step 5 if the user has completed the previous steps
        if (workflowState.txHash) {
          setCurrentFlowStep(5);
          if (onProgressUpdate) {
            onProgressUpdate(5);
          }
        } else {
          // If the user hasn't completed the previous steps, reset to step 0
          setCurrentFlowStep(0);
          if (onProgressUpdate) {
            onProgressUpdate(0);
          }
        }
      }

      // Add the command to history immediately with a loading state
      updateCommandHistory((prev) => [
        ...prev,
        {
          id,
          command,
          output: <p className="text-gray-400">Processing command...</p>,
          type: "info",
        },
      ]);

      // Execute the command with the ID and our custom update function for progressive updates
      const result = await executeCommand(command, id, updateCommandHistory);

      // Update the final result
      updateCommandHistory((prev) => {
        const updatedHistory = [...prev];
        const commandIndex = updatedHistory.findIndex((cmd) => cmd.id === id);
        if (commandIndex !== -1) {
          updatedHistory[commandIndex] = {
            ...updatedHistory[commandIndex],
            output: result.output,
            type: result.success ? "success" : result.type || "error",
          };
        }
        return updatedHistory;
      });

      // Special handling for chain selection commands
      if (
        Object.keys(showroomChains).some(
          (chainId) => chainId.toLowerCase() === normalizedCommand
        ) &&
        result.success
      ) {
        // If this was a successful chain selection, update the flow step to prepare-tx (step 2)
        setTimeout(() => {
          setCurrentFlowStep(2);
          if (onProgressUpdate) {
            onProgressUpdate(2);
          }

          // Explicitly set the suggested command to prepare-tx
          setSuggestedCommand("prepare-tx");

          // Set processing state to false after all updates
          setIsProcessingCommand(false);
        }, 500); // Small delay to ensure the UI updates properly
      }
      // Special handling for prepare-tx command - directly update the flow step to 3 (sign-tx)
      else if (normalizedCommand === "prepare-tx" && result.success) {
        // Update to step 3 (sign-tx is the next step)
        setTimeout(() => {
          setCurrentFlowStep(3);
          if (onProgressUpdate) {
            onProgressUpdate(3);
          }

          // Set processing state to false after all updates
          setIsProcessingCommand(false);
        }, 500); // Small delay to ensure the UI updates properly
      }
      // Special handling for sign-tx command - directly update the flow step to 4 (broadcast-tx)
      else if (normalizedCommand === "sign-tx" && result.success) {
        // Update to step 4 (broadcast-tx is the next step)
        setTimeout(() => {
          setCurrentFlowStep(4);
          if (onProgressUpdate) {
            onProgressUpdate(4);
          }

          // Set processing state to false after all updates
          setIsProcessingCommand(false);
        }, 500); // Small delay to ensure the UI updates properly
      }
      // Special handling for broadcast-tx command - directly update the flow step to 5 (explore-chains)
      else if (normalizedCommand === "broadcast-tx" && result.success) {
        // Update to step 5 (explore-chains is the next step)
        setTimeout(() => {
          setCurrentFlowStep(5);
          if (onProgressUpdate) {
            onProgressUpdate(5);
          }

          // Set processing state to false after all updates
          setIsProcessingCommand(false);
        }, 500); // Small delay to ensure the UI updates properly
      }
      // Special handling for explore-chains command
      else if (normalizedCommand === "explore-chains" && result.success) {
        // Update the flow step based on whether the user has completed the guided flow
        setTimeout(() => {
          if (workflowState.txHash) {
            // If the user has completed the guided flow, keep at step 5
            setCurrentFlowStep(5);
            if (onProgressUpdate) {
              onProgressUpdate(5);
            }
          } else {
            // If the user hasn't completed the guided flow, reset to step 0
            setCurrentFlowStep(0);
            if (onProgressUpdate) {
              onProgressUpdate(0);
            }
          }

          // Set processing state to false after all updates
          setIsProcessingCommand(false);
        }, 500); // Small delay to ensure the UI updates properly
      }
      // For all other commands, set processing state to false immediately
      else {
        setIsProcessingCommand(false);
      }

      // After broadcast-tx, suggest explore-chains
      if (normalizedCommand === "broadcast-tx" && result.success) {
        setTimeout(() => {
          setSuggestedCommand("explore-chains");
        }, 1000);
      }

      // After explore-chains, suggest restarting the tutorial
      if (normalizedCommand === "explore-chains" && result.success) {
        setTimeout(() => {
          // If we completed the guided flow, suggest starting a new one
          if (workflowState.txHash) {
            setSuggestedCommand("start");
          }
        }, 1000);
      }
    }

    setCurrentCommand("");
    setCommandIndex(-1);
  };

  const handleConfigChecked = useCallback(() => {
    setSignerConfigChecked(true);
  }, []);

  const handleKeyNavigation = (direction: "up" | "down" | "tab") => {
    if (direction === "tab") {
      if (suggestedCommand && !currentCommand) {
        setCurrentCommand(suggestedCommand);
      }
      return;
    }

    if (commandHistory.length === 0) return;

    if (direction === "up") {
      const newIndex =
        commandIndex < commandHistory.length - 1
          ? commandIndex + 1
          : commandIndex;
      setCommandIndex(newIndex);
      setCurrentCommand(
        commandHistory[commandHistory.length - 1 - newIndex]?.command || ""
      );
    } else {
      const newIndex = commandIndex > 0 ? commandIndex - 1 : -1;
      setCommandIndex(newIndex);
      setCurrentCommand(
        newIndex === -1
          ? ""
          : commandHistory[commandHistory.length - 1 - newIndex]?.command || ""
      );
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCommand.trim()) return;

    // Set processing state to true
    setIsProcessingCommand(true);

    // Add command to history
    updateCommandHistory((prev) => [
      ...prev,
      {
        id: commandCount.current++,
        command: currentCommand,
        output: null,
        type: "info",
      },
    ]);
    setCommandIndex(-1);

    // Execute command and get output
    const output = await executeCommand(currentCommand);

    // Add command and output to entries
    updateCommandHistory((prev) => [
      ...prev,
      {
        id: commandCount.current++,
        command: currentCommand,
        output: output.output,
        type: output.success ? "success" : output.type || "error",
      },
    ]);

    setCurrentCommand("");

    // Set processing state to false
    setIsProcessingCommand(false);
  };

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Tab for auto-complete
    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestedCommand && !currentCommand) {
        setCurrentCommand(suggestedCommand);
      }
      return;
    }

    // Handle up/down arrows for command history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandIndex < commandHistory.length - 1) {
        const newIndex = commandIndex + 1;
        setCommandIndex(newIndex);
        setCurrentCommand(
          commandHistory[commandHistory.length - 1 - newIndex]?.command || ""
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1;
        setCommandIndex(newIndex);
        setCurrentCommand(
          newIndex === -1
            ? ""
            : commandHistory[commandHistory.length - 1 - newIndex]?.command ||
                ""
        );
      } else if (commandIndex === 0) {
        setCommandIndex(-1);
        setCurrentCommand("");
      }
    }
  };

  // Call onProgressUpdate when component mounts
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(currentFlowStep);
    }
  }, [onProgressUpdate, currentFlowStep]);

  return (
    <div
      className={cn(
        "terminal-window flex flex-col w-full h-full max-h-[80vh]",
        className
      )}
      onClick={handleTerminalClick}
    >
      <div className="terminal-header flex items-center gap-2 px-4 py-3">
        <div className="terminal-button bg-red-500"></div>
        <div className="terminal-button bg-yellow-500"></div>
        <div className="terminal-button bg-green-500"></div>
        <div className="ml-4 text-xs text-gray-400 flex-1 text-center">
          Adamik Multichain Demo
        </div>
      </div>

      <div
        ref={terminalRef}
        className="terminal-content flex-1 p-4 overflow-y-auto"
      >
        {!signerConfigChecked && (
          <SodotConfigStatus onConfigChecked={handleConfigChecked} />
        )}

        {signerConfigChecked && showWelcomeMessage && (
          <div
            key="welcome-message"
            className="animate-text-fade-in opacity-0 text-terminal-muted mb-2"
          >
            {welcomeMessage}
          </div>
        )}

        {commandHistory.map((entry) => (
          <div key={entry.id} className="mb-2 animate-text-fade-in opacity-0">
            <TerminalOutput
              command={entry.command}
              output={entry.output}
              type={entry.type}
            />
          </div>
        ))}

        {signerConfigChecked && !isProcessingCommand && (
          <CommandLine
            value={currentCommand}
            onChange={setCurrentCommand}
            onSubmit={handleCommandExecution}
            onKeyNavigation={handleKeyNavigation}
            suggestedCommand={suggestedCommand}
          />
        )}
      </div>
    </div>
  );
};

export default Terminal;
