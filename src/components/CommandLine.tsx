
import React, { useRef, useEffect } from 'react';

interface CommandLineProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyNavigation: (direction: 'up' | 'down') => void;
}

const CommandLine: React.FC<CommandLineProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyNavigation
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
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onKeyNavigation('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onKeyNavigation('down');
    }
  };

  return (
    <div 
      ref={wrapperRef} 
      className="flex items-center mt-1 animate-text-fade-in opacity-0"
      onClick={handleClick}
    >
      <span className="terminal-prompt mr-2">$</span>
      <input
        ref={inputRef}
        type="text"
        className="command-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Terminal command input"
      />
      <span className="terminal-cursor ml-px"></span>
    </div>
  );
};

export default CommandLine;
