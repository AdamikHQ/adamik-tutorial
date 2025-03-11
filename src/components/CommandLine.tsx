import React, { useRef, useEffect } from "react";

interface CommandLineProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyNavigation: (direction: "up" | "down" | "tab") => void;
  suggestedCommand?: string;
}

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandLine;
