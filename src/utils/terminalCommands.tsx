
import React from 'react';

// Define the structure for commands
type CommandResult = {
  success: boolean;
  output: React.ReactNode;
  type?: 'success' | 'error' | 'info';
};

// Command definitions
const commands = {
  help: {
    name: 'help',
    description: 'Shows a list of available commands',
    execute: (): CommandResult => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Available commands:</p>
          <ul className="list-disc ml-4">
            {Object.values(commands).map((cmd) => (
              <li key={cmd.name} className="mb-1">
                <strong>{cmd.name}</strong> - {cmd.description}
              </li>
            ))}
          </ul>
        </div>
      ),
      type: 'info'
    }),
  },
  
  intro: {
    name: 'intro',
    description: 'Displays an introduction to the API',
    execute: (): CommandResult => ({
      success: true,
      output: 'Welcome to our API tutorial! This interactive terminal will guide you through our API features and how to use them effectively. Type "tutorial" to begin a step-by-step guide.',
      type: 'success'
    }),
  },
  
  tutorial: {
    name: 'tutorial',
    description: 'Starts a step-by-step tutorial',
    execute: (): CommandResult => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Let's start with the basics:</p>
          <ol className="list-decimal ml-4">
            <li className="mb-1">First, you'll need to authenticate using the "auth" command</li>
            <li className="mb-1">Then, try making a sample request with "request example"</li>
            <li className="mb-1">Finally, explore advanced features with "advanced"</li>
          </ol>
          <p className="mt-2">Type these commands in sequence to learn more.</p>
        </div>
      ),
      type: 'info'
    }),
  },
  
  auth: {
    name: 'auth',
    description: 'Shows authentication methods',
    execute: (): CommandResult => ({
      success: true,
      output: 'To authenticate with our API, you need to generate an API key from your dashboard and include it in the request headers as "X-API-Key".',
      type: 'info'
    }),
  },
  
  request: {
    name: 'request',
    description: 'Makes a sample API request',
    execute: (args: string[] = []): CommandResult => {
      if (args[0] === 'example') {
        return {
          success: true,
          output: (
            <div>
              <p className="mb-2">Example request:</p>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto">
                {`curl -H "X-API-Key: your_api_key" https://api.example.com/v1/data`}
              </pre>
              <p className="mt-2">Response:</p>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto">
                {`{
  "status": "success",
  "data": {
    "items": [
      { "id": 1, "name": "Sample Item" }
    ]
  }
}`}
              </pre>
            </div>
          ),
          type: 'success'
        };
      }
      
      return {
        success: false,
        output: 'Please specify what type of request to make. Try "request example"',
        type: 'error'
      };
    },
  },
  
  advanced: {
    name: 'advanced',
    description: 'Shows advanced API features',
    execute: (): CommandResult => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Advanced API features:</p>
          <ul className="list-disc ml-4">
            <li className="mb-1">Pagination - Use "page" and "limit" query parameters</li>
            <li className="mb-1">Sorting - Use "sort" query parameter (e.g., "sort=name:asc")</li>
            <li className="mb-1">Filtering - Use filter notation (e.g., "filter[name]=test")</li>
            <li className="mb-1">Batch requests - Send multiple operations in a single request</li>
          </ul>
        </div>
      ),
      type: 'info'
    }),
  },
  
  clear: {
    name: 'clear',
    description: 'Clears the terminal',
    execute: (): CommandResult => ({
      success: true,
      output: 'Terminal cleared',
      type: 'success'
    }),
  },
};

// Main function to execute commands
export const executeCommand = async (input: string): Promise<CommandResult> => {
  const args = input.trim().split(' ');
  const commandName = args[0].toLowerCase();
  const commandArgs = args.slice(1);
  
  if (!commandName) {
    return {
      success: false,
      output: 'Please enter a command. Type "help" to see available commands.',
      type: 'error'
    };
  }
  
  const command = Object.values(commands).find(cmd => cmd.name === commandName);
  
  if (!command) {
    return {
      success: false,
      output: `Command not found: ${commandName}. Type "help" to see available commands.`,
      type: 'error'
    };
  }
  
  try {
    return command.execute(commandArgs);
  } catch (error) {
    console.error('Command execution error:', error);
    return {
      success: false,
      output: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error'
    };
  }
};
