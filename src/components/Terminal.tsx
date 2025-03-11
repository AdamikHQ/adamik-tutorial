import React, { useState, useRef, useEffect } from "react";
import CommandLine from "./CommandLine";
import TerminalOutput from "./TerminalOutput";
import { executeCommand } from "../utils/terminalCommands";
import { cn } from "@/lib/utils";
import { useApiLogs } from "../contexts/ApiLogsContext";

interface TerminalProps {
  className?: string;
  welcomeMessage?: React.ReactNode;
  initialCommands?: string[];
}

interface CommandEntry {
  id: number;
  command: string;
  output: React.ReactNode;
  type: "success" | "error" | "info";
}

const Terminal: React.FC<TerminalProps> = ({
  className,
  welcomeMessage = (
    <span>
      Welcome to the API Terminal. Available commands:{" "}
      <span className="font-mono">
        <span className="text-purple-500">$</span>{" "}
        <span className="text-green-500 font-bold">help</span>
      </span>
      ,{" "}
      <span className="font-mono">
        <span className="text-purple-500">$</span>{" "}
        <span className="text-blue-500 font-bold">start</span>
      </span>
      ,{" "}
      <span className="font-mono">
        <span className="text-purple-500">$</span>{" "}
        <span className="text-red-500 font-bold">clear</span>
      </span>
    </span>
  ),
  initialCommands = [],
}) => {
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandCount = useRef<number>(0);
  const apiLogs = useApiLogs();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(true);
  const [suggestedCommand, setSuggestedCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Process initial commands on mount
  useEffect(() => {
    // Reset the helpExecuted flag when the component mounts
    sessionStorage.removeItem("helpExecuted");

    if (initialCommands.length > 0) {
      const delay = 500; // delay between commands in ms

      initialCommands.forEach((cmd, index) => {
        setTimeout(() => {
          handleCommandExecution(cmd);
        }, delay * (index + 1));
      });
    }
  }, []);

  // Auto scroll to bottom when new commands are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Focus input on mount and when clicking terminal
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Define the guided flow
  const guidedFlow = [
    "start",
    "optimism",
    "prepare-tx",
    "sign-tx",
    "broadcast-tx",
  ];

  // Determine the next suggested command based on command history
  useEffect(() => {
    if (commandHistory.length === 0) {
      setSuggestedCommand("start");
      return;
    }

    const lastCommand = commandHistory[commandHistory.length - 1].command;
    const lastOutput = commandHistory[commandHistory.length - 1].output;

    // Check if the last command was a chain selection
    // We can detect this by checking if the last command is a valid chain ID
    // from the list of available chains in sessionStorage
    let isChainSelection = false;
    const chainIdsJson = sessionStorage.getItem("adamikChainIds");
    if (chainIdsJson) {
      try {
        const chainIds = JSON.parse(chainIdsJson);
        isChainSelection = chainIds.includes(lastCommand);
      } catch (e) {
        console.error("Error parsing chainIds from sessionStorage:", e);
      }
    }

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
            (grandchild.includes("Address:") || grandchild.includes("Balance:"))
        )
      );

    // Find the current position in the guided flow
    const currentIndex = guidedFlow.indexOf(lastCommand);

    // If the last command is in our flow and not the last step, suggest the next one
    if (currentIndex >= 0 && currentIndex < guidedFlow.length - 1) {
      setSuggestedCommand(guidedFlow[currentIndex + 1]);
    } else if (lastCommand === "clear") {
      // If user cleared the terminal, suggest starting again
      setSuggestedCommand("start");
    } else if (lastCommand === "help") {
      // After help command, suggest start as the next action
      setSuggestedCommand("start");
    } else if (lastCommand === "broadcast-tx") {
      // After completing the flow with broadcast-tx, suggest starting a new cycle
      setSuggestedCommand("start");
    } else if (isChainSelection || hasChainDetails) {
      // If the last command was a valid chain ID or the output shows chain details,
      // suggest prepare-tx
      setSuggestedCommand("prepare-tx");
    } else if (inChainSelectionMode) {
      // If we're in chain selection mode but the command wasn't a valid chain,
      // keep suggesting chain selection (by not changing the suggestion)
      // This allows users to try different chain IDs until they get a valid one
    } else {
      // Default suggestion for any other command
      setSuggestedCommand("start");
    }
  }, [commandHistory]);

  const handleCommandExecution = async (command: string) => {
    if (!command.trim()) return;

    // Hide welcome message for all commands
    setShowWelcomeMessage(false);

    const id = commandCount.current++;
    const result = await executeCommand(command);

    if (result.clearTerminal) {
      // Clear the API logs if the clear command is executed
      if (command.trim().toLowerCase() === "clear") {
        apiLogs.clearLogs();
        setShowWelcomeMessage(true); // Show the welcome message again after clear
      }

      // Clear the terminal history but preserve the output from the clear command
      setCommandHistory([
        {
          id,
          command,
          output: result.output,
          type: result.success ? "success" : result.type || "error",
        },
      ]);
    } else {
      setCommandHistory((prev) => [
        ...prev,
        {
          id,
          command,
          output: result.output,
          type: result.success ? "success" : result.type || "error",
        },
      ]);
    }

    setCurrentCommand("");
    setCommandIndex(-1);
  };

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

    // Add command to history
    setCommandHistory((prev) => [
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
    setCommandHistory((prev) => [
      ...prev,
      {
        id: commandCount.current++,
        command: currentCommand,
        output: output.output,
        type: output.success ? "success" : output.type || "error",
      },
    ]);

    setCurrentCommand("");
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
          API Terminal
        </div>
      </div>

      <div
        ref={terminalRef}
        className="terminal-content flex-1 p-4 overflow-y-auto"
      >
        {showWelcomeMessage && (
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

        <CommandLine
          value={currentCommand}
          onChange={setCurrentCommand}
          onSubmit={handleCommandExecution}
          onKeyNavigation={handleKeyNavigation}
          suggestedCommand={suggestedCommand}
        />
      </div>
    </div>
  );
};

export default Terminal;
