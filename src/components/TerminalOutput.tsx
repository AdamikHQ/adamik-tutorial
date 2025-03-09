
import React from 'react';
import TypingEffect from './TypingEffect';

interface TerminalOutputProps {
  command: string;
  output: React.ReactNode;
  type: 'success' | 'error' | 'info';
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ command, output, type }) => {
  return (
    <div>
      <div className="flex items-center">
        <span className="terminal-prompt mr-2">$</span>
        <span className="terminal-text">{command}</span>
      </div>
      
      <div className={`ml-4 mt-1 ${
        type === 'success' ? 'command-success' : 
        type === 'error' ? 'command-error' : 
        'terminal-text'
      }`}>
        {typeof output === 'string' ? (
          <TypingEffect text={output} />
        ) : (
          output
        )}
      </div>
    </div>
  );
};

export default TerminalOutput;
