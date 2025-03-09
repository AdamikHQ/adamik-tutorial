import React, { useState, useRef, useEffect } from "react";
import CommandLine from "./CommandLine";
import TerminalOutput from "./TerminalOutput";
import { executeCommand } from "../utils/terminalCommands";
import { cn } from "@/lib/utils";

interface TerminalProps {
  className?: string;
  welcomeMessage?: string;
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
  welcomeMessage = "Welcome to the API Terminal. Type 'help' to get started.",
  initialCommands = [],
}) => {
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandCount = useRef<number>(0);

  // Process initial commands on mount
  useEffect(() => {
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

  const handleCommandExecution = async (command: string) => {
    if (!command.trim()) return;

    const id = commandCount.current++;
    const result = await executeCommand(command);

    if (result.clearTerminal) {
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

  const handleKeyNavigation = (direction: "up" | "down") => {
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

  return (
    <div
      className={cn(
        "terminal-window flex flex-col w-full h-full max-h-[80vh]",
        className
      )}
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
        <div className="animate-text-fade-in opacity-0 text-terminal-muted mb-2">
          {welcomeMessage}
        </div>

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
        />
      </div>
    </div>
  );
};

export default Terminal;
