import React from "react";
import { AdamikChain } from "../adamik/types";

// Define the structure for commands
type CommandResult = {
  success: boolean;
  output: React.ReactNode;
  type?: "success" | "error" | "info";
  chainSelection?: boolean;
  clearTerminal?: boolean;
};

// Track the current state of the workflow
type WorkflowState = {
  selectedChain?: string;
  selectedChainData?: AdamikChain;
  address?: string;
  pubkey?: string;
  balance?: any;
  transaction?: any;
  signature?: string;
  txHash?: string;
};

// Global state to track workflow progress
let workflowState: WorkflowState = {};

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

  clear: {
    name: "clear",
    description: "Clears the terminal",
    execute: (_args: string[] = []): CommandResult => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Terminal cleared</p>
          <p className="mb-2">Available commands:</p>
          <ul className="list-disc ml-4">
            <li className="mb-1">
              <strong>help</strong> - Shows a list of available commands
            </li>
            <li className="mb-1">
              <strong>start</strong> - Launches an interactive flow to explore
              blockchain networks
            </li>
            <li className="mb-1">
              <strong>clear</strong> - Clears the terminal
            </li>
          </ul>
        </div>
      ),
      type: "success",
      clearTerminal: true,
    }),
  },

  start: {
    name: "start",
    description: "Launches an interactive flow to explore blockchain networks",
    execute: async (_args: string[] = []): Promise<CommandResult> => {
      try {
        // Reset workflow state when starting a new flow
        workflowState = {};

        const apiKey = import.meta.env.VITE_ADAMIK_API_KEY;
        const apiBaseUrl = import.meta.env.VITE_ADAMIK_API_BASE_URL;

        if (!apiKey || !apiBaseUrl) {
          throw new Error(
            "Missing API configuration. Please check your environment variables."
          );
        }

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

        // Store chains in session storage
        sessionStorage.setItem("adamikChains", JSON.stringify(chains));

        // Format chains for display
        const chainsList = Object.entries(chains).map(([chainId, chain]) => ({
          id: chainId,
          name: chain.name,
          ticker: chain.ticker,
        }));

        return {
          success: true,
          output: (
            <div>
              <p className="mb-4 text-green-400 font-bold">
                ✓ Successfully retrieved {chainsList.length} blockchain
                networks!
              </p>
              <p className="mb-2">Please select a chain by entering its ID:</p>
              <div className="bg-gray-800 p-3 rounded mb-4 max-h-60 overflow-y-auto">
                {chainsList.map((chain) => (
                  <div key={chain.id} className="mb-1">
                    <strong className="text-yellow-400">{chain.id}</strong>:{" "}
                    {chain.name} ({chain.ticker})
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Enter a chain ID in the terminal below (e.g.,{" "}
                <code>ethereum</code>, <code>bitcoin</code>, etc.)
              </p>
            </div>
          ),
          type: "info",
          chainSelection: true,
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
                <li>
                  The API server is not running at{" "}
                  {import.meta.env.VITE_ADAMIK_API_BASE_URL}
                </li>
                <li>The API key is invalid or missing</li>
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

  // Special handling for chain selection after the start command
  const lastCommandResult = sessionStorage.getItem("lastCommandResult");
  if (lastCommandResult) {
    const parsedResult = JSON.parse(lastCommandResult);
    if (
      parsedResult.chainSelection &&
      commandName !== "help" &&
      commandName !== "start" &&
      commandName !== "clear"
    ) {
      // User is selecting a chain
      const chainId = commandName;

      // Get chains from session storage
      const chainsJson = sessionStorage.getItem("adamikChains");
      if (!chainsJson) {
        return {
          success: false,
          output: 'No chains data available. Please run "start" again.',
          type: "error",
        };
      }

      const chains = JSON.parse(chainsJson);

      if (!chains[chainId]) {
        return {
          success: false,
          output: (
            <div>
              <p className="text-red-400 mb-2">
                Chain not found: <strong>{chainId}</strong>
              </p>
              <p>Please enter a valid chain ID from the list above.</p>
            </div>
          ),
          type: "error",
          chainSelection: true, // Keep the chain selection flag
        };
      }

      // Chain found, display information
      const chain = chains[chainId];

      // Clear the chain selection state
      sessionStorage.removeItem("lastCommandResult");

      return {
        success: true,
        output: (
          <div>
            <p className="mb-4 text-green-400 font-bold">
              ✓ Chain selected: {chain.name}
            </p>
            <div className="bg-gray-800 p-4 rounded mb-4">
              <h3 className="text-lg font-bold mb-2 text-yellow-400">
                {chain.name} ({chainId})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1">
                    <strong>Token:</strong> {chain.ticker}
                  </p>
                  <p className="mb-1">
                    <strong>Decimals:</strong> {chain.decimals}
                  </p>
                  <p className="mb-1">
                    <strong>Family:</strong> {chain.family}
                  </p>
                </div>
                <div>
                  <p className="mb-1">
                    <strong>Curve:</strong> {chain.signerSpec.curve}
                  </p>
                  <p className="mb-1">
                    <strong>Hash Function:</strong>{" "}
                    {chain.signerSpec.hashFunction}
                  </p>
                  <p className="mb-1">
                    <strong>Coin Type:</strong> {chain.signerSpec.coinType}
                  </p>
                </div>
              </div>
            </div>
            <p className="mb-2">Supported Features:</p>
            <ul className="list-disc ml-4 mb-4">
              {Object.entries(chain.supportedFeatures).map(
                ([category, features]) => (
                  <li key={category}>
                    <strong className="capitalize">{category}:</strong>{" "}
                    {Object.keys(features).join(", ")}
                  </li>
                )
              )}
            </ul>
            <p className="mt-4">
              Type <code>start</code> to select a different chain.
            </p>
          </div>
        ),
        type: "success",
      };
    }
  }

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
    const result = await command.execute(commandArgs);

    // Store the result if it's a chain selection step
    if (result.chainSelection) {
      sessionStorage.setItem(
        "lastCommandResult",
        JSON.stringify({
          chainSelection: true,
        })
      );
    }

    return result;
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
