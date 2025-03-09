import React from "react";
import { AdamikChain } from "../adamik/types";

// Define the structure for commands
type CommandResult = {
  success: boolean;
  output: React.ReactNode;
  type?: "success" | "error" | "info";
};

// Command definitions
const commands = {
  help: {
    name: "help",
    description: "Shows a list of available commands",
    execute: (_args: string[] = []): CommandResult => ({
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
      type: "info",
    }),
  },

  intro: {
    name: "intro",
    description: "Displays an introduction to the API",
    execute: (_args: string[] = []): CommandResult => ({
      success: true,
      output:
        'Welcome to our API tutorial! This interactive terminal will guide you through our API features and how to use them effectively. Type "help" to see available commands.',
      type: "success",
    }),
  },

  getChains: {
    name: "getChains",
    description: "Lists available blockchain networks from Adamik API",
    execute: async (_args: string[] = []): Promise<CommandResult> => {
      try {
        // Hardcoded values for development
        const apiKey = "4e91430e-3622-4bb9-86f5-803090d7a913";
        const apiBaseUrl = "http://localhost:3000";

        // Show loading message
        console.log("Fetching chains from API...");

        // Fetch chains from Adamik API
        const response = await fetch(`${apiBaseUrl}/api/chains`, {
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Check if chains data exists
        if (!data.chains) {
          throw new Error("No chains data found in API response");
        }

        const chains: Record<string, AdamikChain> = data.chains;

        // Store chains in session storage for other commands
        sessionStorage.setItem("adamikChains", JSON.stringify(chains));

        return {
          success: true,
          output: (
            <div>
              <p className="mb-2">Available chains from Adamik API:</p>
              <ul className="list-disc ml-4">
                {Object.entries(chains).map(([chainId, chain]) => (
                  <li key={chainId} className="mb-1">
                    <strong>{chain.name}</strong> ({chainId}) - {chain.ticker}
                  </li>
                ))}
              </ul>
            </div>
          ),
          type: "info",
        };
      } catch (error) {
        console.error("Error fetching chains:", error);
        return {
          success: false,
          output: (
            <div>
              <p>
                Error fetching chains:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                This could be because:
              </p>
              <ul className="list-disc ml-4 text-xs text-gray-400">
                <li>The API server is not running at http://localhost:3000</li>
                <li>The API key is invalid</li>
                <li>The API endpoint structure has changed</li>
              </ul>
              <p className="mt-2 text-xs">
                Check the browser console for more details.
              </p>
            </div>
          ),
          type: "error",
        };
      }
    },
  },
};

// Main function to execute commands
export const executeCommand = async (input: string): Promise<CommandResult> => {
  const args = input.trim().split(" ");
  const commandName = args[0].toLowerCase();
  const commandArgs = args.slice(1);

  if (!commandName) {
    return {
      success: false,
      output: 'Please enter a command. Type "help" to see available commands.',
      type: "error",
    };
  }

  const command = Object.values(commands).find(
    (cmd) => cmd.name.toLowerCase() === commandName
  );

  if (!command) {
    return {
      success: false,
      output: `Command not found: ${commandName}. Type "help" to see available commands.`,
      type: "error",
    };
  }

  try {
    return command.execute(commandArgs);
  } catch (error) {
    console.error("Command execution error:", error);
    return {
      success: false,
      output: `Error executing command: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      type: "error",
    };
  }
};
