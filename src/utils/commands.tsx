import React from "react";
import {
  Command,
  CommandResult,
  resetWorkflowState,
  workflowState,
} from "./terminalTypes";
import { showroomChains } from "./showroomChains";
import { SodotSigner } from "../signers/Sodot";
import { encodePubKeyToAddress } from "../adamik/encodePubkeyToAddress";
import { getAccountState } from "../adamik/getAccountState";
import { infoTerminal } from "./utils";
import { AdamikChain } from "../adamik/types";
import { adamikGetChain } from "../adamik/getChain";

// Help command
export const helpCommand: Command = {
  name: "help",
  description: "Shows a list of available commands",
  execute: (_args: string[] = []): CommandResult => ({
    success: true,
    output: (
      <div>
        <p className="mb-2">Available commands:</p>
        <ul className="list-disc ml-4">
          <li className="mb-1">
            <strong>start</strong> - Launches an interactive flow to explore
            blockchain
          </li>
          <li className="mb-1">
            <strong>help</strong> - Shows a list of available commands
          </li>
          <li className="mb-1">
            <strong>getChains</strong> - Shows the complete list of chains
            supported by Adamik API
          </li>
          <li className="mb-1">
            <strong>chain</strong> - Shows detailed information about a specific
            chain
          </li>
          <li className="mb-1">
            <strong>clear</strong> - Clears the terminal
          </li>
        </ul>
      </div>
    ),
    type: "info",
  }),
};

// Clear command
export const clearCommand: Command = {
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
            <strong>start</strong> - Launches an interactive flow to explore
            blockchain
          </li>
          <li className="mb-1">
            <strong>help</strong> - Shows a list of available commands
          </li>
          <li className="mb-1">
            <strong>getChains</strong> - Shows the complete list of chains
            supported by Adamik API
          </li>
          <li className="mb-1">
            <strong>chain</strong> - Shows detailed information about a specific
            chain
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
};

// Chain command
export const chainCommand: Command = {
  name: "chain",
  description: "Shows detailed information about a specific chain",
  execute: async (args: string[] = []): Promise<CommandResult> => {
    try {
      if (!args[0]) {
        return {
          success: false,
          output: (
            <div>
              <p className="text-red-400 mb-2">
                Please specify a chain ID. Example: <code>chain ethereum</code>
              </p>
              <p className="text-sm text-gray-400">
                Use <code>getChains</code> to see available chain IDs.
              </p>
            </div>
          ),
          type: "error",
        };
      }

      const chainId = args[0].toLowerCase();

      // Fetch chain details from API
      console.log(`Fetching chain information for ${chainId}...`);
      const chain = await adamikGetChain(chainId);

      return {
        success: true,
        output: renderChainDetails(chainId, chain),
        type: "success",
      };
    } catch (error) {
      console.error("Error in chain command:", error);
      return {
        success: false,
        output: (
          <div>
            <p className="text-red-400 mb-2">
              Error fetching chain information:
            </p>
            <p>{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        ),
        type: "error",
      };
    }
  },
};

// Helper function to render chain details
const renderChainDetails = (chainId: string, chain: AdamikChain) => {
  return (
    <div>
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
              <strong>Hash Function:</strong> {chain.signerSpec.hashFunction}
            </p>
            <p className="mb-1">
              <strong>Coin Type:</strong> {chain.signerSpec.coinType}
            </p>
          </div>
        </div>

        {/* Supported Features section - temporarily hidden
        <div className="mt-3">
          <p className="mb-1"><strong>Supported Features:</strong></p>
          <ul className="list-disc ml-4">
            {Object.entries(chain.supportedFeatures).map(
              ([category, features]) => (
                <li key={category}>
                  <strong className="capitalize">{category}:</strong>{" "}
                  {Object.keys(features).join(", ")}
                </li>
              )
            )}
          </ul>
        </div>
        */}
      </div>

      <p className="text-sm text-gray-400">
        Use <code>start</code> to generate keys and addresses for this chain.
      </p>
    </div>
  );
};

// GetChains command
export const getChainsCommand: Command = {
  name: "getChains",
  description: "Shows the complete list of chains supported by Adamik API",
  execute: async (_args: string[] = []): Promise<CommandResult> => {
    try {
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

      const chains = data.chains as Record<string, AdamikChain>;

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
              ✓ Successfully retrieved {chainsList.length} blockchain networks!
            </p>
            <p className="mb-2">Available chains:</p>
            <div className="bg-gray-800 p-3 rounded mb-4 max-h-60 overflow-y-auto">
              {chainsList.map((chain) => (
                <div key={chain.id} className="mb-1">
                  <strong className="text-yellow-400">{chain.id}</strong>:{" "}
                  {chain.name} ({chain.ticker})
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Use the <code>chain</code> command to view details about a
              specific chain (e.g., <code>chain ethereum</code>)
            </p>
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
            <p className="mt-2 text-xs text-gray-400">This could be because:</p>
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
};

// Start command
export const startCommand: Command = {
  name: "start",
  description: "Launches an interactive flow to explore blockchain",
  execute: async (_args: string[] = []): Promise<CommandResult> => {
    try {
      // Reset workflow state when starting a new flow
      resetWorkflowState();

      // Store chains in session storage
      sessionStorage.setItem(
        "adamikChainIds",
        JSON.stringify(Object.keys(showroomChains))
      );

      // Format chains for display
      const chainsList = Object.entries(showroomChains).map(
        ([chainId, chain]) => ({
          id: chainId,
          name: chain.name,
          ticker: chain.ticker,
        })
      );

      return {
        success: true,
        output: (
          <div>
            <p className="mb-4 text-green-400 font-bold">
              ✓ Successfully retrieved {chainsList.length} blockchain networks!
            </p>
            <p className="mb-2">Please select a chain by entering its ID:</p>
            <div className="bg-gray-800 p-3 rounded mb-4">
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
      console.error("Error in start command:", error);
      return {
        success: false,
        output: (
          <div>
            <p>
              Error starting flow:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ),
        type: "error",
      };
    }
  },
};
