import React, { useRef, useEffect } from "react";

interface CommandLineProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyNavigation: (direction: "up" | "down" | "tab") => void;
  suggestedCommand?: string;
}

// Command descriptions for better context
const commandDescriptions: Record<string, string> = {
  start: "Begin the tutorial and explore available chains",
  "prepare-tx": "Prepare a transaction for the selected chain",
  "sign-tx": "Sign the prepared transaction",
  "broadcast-tx": "Broadcast the signed transaction to the network",
  help: "Show available commands",
  clear: "Clear the terminal",
  // Add chain-specific descriptions
  optimism: "Select Optimism blockchain",
  ethereum: "Select Ethereum blockchain",
  bitcoin: "Select Bitcoin blockchain",
  tron: "Select Tron blockchain",
  polygon: "Select Polygon blockchain",
  arbitrum: "Select Arbitrum blockchain",
  avalanche: "Select Avalanche blockchain",
  bsc: "Select BNB Chain",
  cosmoshub: "Select Cosmos Hub blockchain",
  ton: "Select TON blockchain",
};

const CommandLine: React.FC<CommandLineProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyNavigation,
  suggestedCommand,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onKeyNavigation("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onKeyNavigation("down");
    } else if (e.key === "Tab") {
      e.preventDefault();
      onKeyNavigation("tab");
    }
  };

  // Get the description for the suggested command
  const suggestionDescription = suggestedCommand
    ? commandDescriptions[suggestedCommand] || `Run ${suggestedCommand} command`
    : "";

  return (
    <div
      ref={wrapperRef}
      className="flex items-center mt-1 animate-text-fade-in opacity-0"
      onClick={handleClick}
    >
      <span className="terminal-prompt mr-2">$</span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          className="command-input w-full z-10 relative"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Terminal command input"
        />
        {!value && suggestedCommand && (
          <div className="absolute inset-0 flex items-center pointer-events-none pl-[2px]">
            <span className="command-suggestion">{suggestedCommand}</span>
            <div className="flex items-center ml-2">
              <span className="tab-key-indicator">⇥</span>
              <span className="command-suggestion-hint ml-1">Tab</span>
              {suggestionDescription && (
                <span className="command-description ml-2 text-gray-500">
                  - {suggestionDescription}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandLine;
