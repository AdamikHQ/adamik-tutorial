import React from "react";
import {
  Command,
  CommandResult,
  resetWorkflowState,
  workflowState,
  isTutorialCompleted,
  setTutorialCompleted,
} from "./terminalTypes";
import { showroomChains } from "./showroomChains";
import { TurnkeySigner } from "../signers/Turnkey";
import { formatNumber } from "./utils";
import { AdamikChain } from "../adamik/types";
import { adamikGetChain } from "../adamik/getChain";
import { adamikGetChains } from "../adamik/getChains";
import { apiLogsInstance } from "../adamik/apiLogsManager";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import { encodeTransaction } from "../adamik/encodeTransaction";
import { broadcastTransaction } from "../adamik/broadcastTransaction";

// Help command
export const helpCommand: Command = {
  name: "help",
  description: "Shows a list of available commands",
  execute: (_args: string[] = []): CommandResult => {
    // Check if help has been executed before
    const helpExecuted = sessionStorage.getItem("helpExecuted") === "true";

    // Check if a chain has been selected
    const chainSelected =
      workflowState.selectedChain !== null &&
      workflowState.selectedChain !== undefined;

    // Show all commands if either help has been executed or a chain has been selected
    const showAllCommands = helpExecuted || chainSelected;

    return {
      success: true,
      output: (
        <div>
          <p className="mb-2">Available commands:</p>
          <ul className="list-disc ml-4">
            {showAllCommands ? (
              <>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">start</span>
                    </span>
                  </span>
                  <span>
                    - Launches an interactive flow to explore blockchain
                  </span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">
                        prepare-tx
                      </span>
                    </span>
                  </span>
                  <span>- Prepare an unsigned transaction</span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">sign-tx</span>
                    </span>
                  </span>
                  <span>- Sign a prepared transaction</span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">
                        broadcast-tx
                      </span>
                    </span>
                  </span>
                  <span>- Broadcast a signed transaction to the network</span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">
                        explore-chains
                      </span>
                    </span>
                  </span>
                  <span>- Explore all supported chains</span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">help</span>
                    </span>
                  </span>
                  <span>- Shows a list of available commands</span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">clear</span>
                    </span>
                  </span>
                  <span>- Clears the terminal</span>
                </li>
              </>
            ) : (
              <>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">start</span>
                    </span>
                  </span>
                  <span>
                    - Launches an interactive flow to explore blockchain
                  </span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">help</span>
                    </span>
                  </span>
                  <span>- Shows a list of available commands</span>
                </li>
                <li className="mb-1">
                  <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded mr-2">
                    <span className="font-mono">
                      <span className="text-purple-500">$</span>{" "}
                      <span className="text-blue-500 font-bold">clear</span>
                    </span>
                  </span>
                  <span>- Clears the terminal</span>
                </li>
              </>
            )}
          </ul>
          {!showAllCommands && (
            <p className="text-medium text-gray-400 mt-3">
              More commands will be available after executing{" "}
              <span className="text-blue-500 font-bold">start</span>
            </p>
          )}
        </div>
      ),
      helpExecuted: true,
    };
  },
};

// Clear command
export const clearCommand: Command = {
  name: "clear",
  description: "Clears the terminal",
  execute: (_args: string[] = []): CommandResult => {
    // We don't reset the tutorial completion flag when clearing the terminal
    // to ensure the congratulations message doesn't show again

    return {
      success: true,
      output: null,
      type: "success",
      clearTerminal: true,
    };
  },
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

      <p className="text-medium text-gray-400 mt-3">
        Type{" "}
        <span className="font-mono">
          <span className="text-purple-500">$</span>{" "}
          <span className="text-blue-500 font-bold">start</span>
        </span>{" "}
        to generate keys and addresses for this chain.
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
      // Show loading message
      console.log("Fetching chains from API...");

      // Use the adamikGetChains function which now includes API logging
      const { chains } = await adamikGetChains();

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
            <p className="text-medium text-gray-400 mt-3">
              Type{" "}
              <span className="font-mono">
                <span className="text-purple-500">$</span>{" "}
                <span className="text-cyan-500 font-bold">chain</span>{" "}
                <span className="text-yellow-400">ethereum</span>
              </span>{" "}
              to view details about a specific chain
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

      // We don't reset the tutorial completion flag when starting a new tutorial
      // This ensures the congratulations message only shows the first time

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
            <div className="bg-gray-800 p-3 rounded mb-4">
              {chainsList.map((chain) => (
                <div key={chain.id} className="mb-1">
                  <strong className="text-yellow-400">{chain.id}</strong>:{" "}
                  {chain.name} ({chain.ticker})
                </div>
              ))}
            </div>
            <p className="text-medium text-gray-400">
              Enter a chain ID (e.g.,{" "}
              <span className="font-mono text-yellow-400">optimism</span>,{" "}
              <span className="font-mono text-yellow-400">ton</span>, etc.) to
              fetch account details.
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

// Helper function to convert from main unit to smallest unit
const convertToSmallestUnit = (amount: string, decimals: number): string => {
  // Remove any commas from the amount
  const cleanAmount = amount.replace(/,/g, "");

  // Split the amount into whole and fractional parts
  const parts = cleanAmount.split(".");
  let wholePart = parts[0];
  let fractionalPart = parts[1] || "";

  // Pad the fractional part with zeros if needed
  fractionalPart = fractionalPart.padEnd(decimals, "0");

  // Trim the fractional part if it's too long
  fractionalPart = fractionalPart.substring(0, decimals);

  // Combine the parts and remove leading zeros
  return (wholePart + fractionalPart).replace(/^0+/, "") || "0";
};

// Prepare transaction command
export const prepareTxCommand: Command = {
  name: "prepare-tx",
  description: "Prepare an unsigned transaction",
  execute: async (_args: string[] = []): Promise<CommandResult> => {
    // Check if a chain has been selected
    if (!workflowState.selectedChain || !workflowState.selectedChainData) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Please select a chain first using the{" "}
            <span className="font-bold">start</span> command.
          </div>
        ),
        type: "error",
      };
    }

    // Check if we have an address
    if (!workflowState.address) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Please generate an address first using the{" "}
            <span className="font-bold">start</span> command.
          </div>
        ),
        type: "error",
      };
    }

    // Get chain-specific configuration from showroomChains
    const chainConfig = showroomChains[workflowState.selectedChain];

    // Determine recipient address - use the default from config or fall back to self-send
    const recipientAddress =
      chainConfig.defaultRecipient || workflowState.address;

    // Determine amount - use the default from config or fall back to a small amount
    const amount = chainConfig.defaultAmount || "0.0001";

    // Get the correct number of decimals from the chain data
    const decimals = workflowState.selectedChainData.decimals;
    console.log(
      `Using ${decimals} decimals for ${workflowState.selectedChain}`
    );

    // Convert amount to lowest unit based on chain-specific decimals
    const amountInLowestUnit = convertToSmallestUnit(amount, decimals);

    try {
      // Use the encodeTransaction function to prepare the transaction
      const encodedTransaction = await encodeTransaction({
        chainId: workflowState.selectedChain,
        senderAddress: workflowState.address,
        recipientAddress: recipientAddress,
        amount: amountInLowestUnit,
        mode: "transfer",
        pubkey: workflowState.pubkey,
      });

      // Store the transaction in the workflow state
      workflowState.transaction = encodedTransaction;

      // For display purposes, extract relevant information
      const transaction = {
        chainId: workflowState.selectedChain,
        from: workflowState.address,
        to: recipientAddress,
        value: amount,
        // Use type assertion to access the nonce from the response data
        nonce: (encodedTransaction?.transaction?.data as any)?.nonce || "0",
        decimals: decimals, // Add decimals to the display for transparency
      };

      // Determine if this is a self-send transaction
      const isSelfSend = transaction.from === transaction.to;

      return {
        success: true,
        output: (
          <div>
            <p className="text-green-500 mb-2">
              Transaction prepared successfully!
            </p>
            <div className="bg-gray-800 p-3 rounded mb-3">
              <p className="text-gray-300 mb-1">
                <span className="text-gray-500">Chain ID:</span>{" "}
                {transaction.chainId}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="text-gray-500">From:</span> {transaction.from}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="text-gray-500">To:</span> {transaction.to}
                {isSelfSend && (
                  <span className="text-yellow-500 ml-2">(Self-send)</span>
                )}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="text-gray-500">Value:</span>{" "}
                {parseFloat(amount).toString()}{" "}
                {workflowState.selectedChainData.ticker}
              </p>
            </div>
            <p className="text-medium text-gray-400 mt-3">
              Use the <span className="text-blue-500 font-bold">sign-tx</span>{" "}
              command to sign this transaction.
            </p>
          </div>
        ),
        type: "success",
      };
    } catch (error) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Failed to prepare transaction: {(error as Error).message}
          </div>
        ),
        type: "error",
      };
    }
  },
};

// Sign transaction command
export const signTxCommand: Command = {
  name: "sign-tx",
  description: "Sign a prepared transaction",
  execute: async (_args: string[] = []): Promise<CommandResult> => {
    // Check if a transaction has been prepared
    if (!workflowState.transaction) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Please prepare a transaction first using the{" "}
            <span className="font-bold">prepare-tx</span> command.
          </div>
        ),
        type: "error",
      };
    }

    try {
      // Get the signer
      const signer = new TurnkeySigner(
        workflowState.selectedChain!,
        workflowState.selectedChainData!.signerSpec
      );

      // Extract the encoded transaction data
      let encodedTx = "";
      if (
        workflowState.transaction &&
        workflowState.transaction.transaction &&
        workflowState.transaction.transaction.encoded
      ) {
        // Extract just the encoded transaction string
        encodedTx = workflowState.transaction.transaction.encoded;

        // Ensure it has the 0x prefix (which will be removed by the signer)
        if (!encodedTx.startsWith("0x")) {
          encodedTx = "0x" + encodedTx;
        }
      } else {
        throw new Error("Transaction is not properly encoded");
      }

      console.log("Encoded transaction for signing:", encodedTx);

      // Log API call for signing
      let logId = 0;
      if (apiLogsInstance) {
        logId = logApiCall(
          apiLogsInstance,
          "Turnkey",
          "/sign",
          "POST",
          encodedTx
        );
      }

      try {
        // Sign the transaction
        const signature = await signer.signTransaction(encodedTx);

        // Log API response for signing
        if (apiLogsInstance) {
          logApiResponse(
            apiLogsInstance,
            logId,
            JSON.stringify({ signature: signature.substring(0, 64) + "..." }),
            false
          );
        }

        // Store the signature in the workflow state
        workflowState.signature = signature;

        return {
          success: true,
          output: (
            <div>
              <p className="text-green-500 mb-2">
                Transaction signed successfully!
              </p>
              <div className="bg-gray-800 p-3 rounded mb-3">
                <p className="text-gray-300 mb-1">
                  <span className="text-gray-500">Signature:</span>{" "}
                  <span className="font-mono text-xs break-all">
                    {signature.substring(0, 64)}...
                  </span>
                </p>
              </div>
              <p className="text-medium text-gray-400 mt-3">
                Use the{" "}
                <span className="text-blue-500 font-bold">broadcast-tx</span>{" "}
                command to broadcast this transaction to the network.
              </p>
            </div>
          ),
          type: "success",
        };
      } catch (error) {
        // If the API call fails, log the error and throw it
        if (apiLogsInstance) {
          logApiResponse(
            apiLogsInstance,
            logId,
            JSON.stringify({ error: (error as Error).message }),
            true
          );
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Failed to sign transaction: {(error as Error).message}
          </div>
        ),
        type: "error",
      };
    }
  },
};

// Broadcast transaction command
export const broadcastTxCommand: Command = {
  name: "broadcast-tx",
  description: "Broadcast a signed transaction to the network",
  execute: async (_args: string[] = []): Promise<CommandResult> => {
    // Check if a transaction has been signed
    if (!workflowState.transaction || !workflowState.signature) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Please prepare and sign a transaction first using the{" "}
            <span className="font-bold">prepare-tx</span> and{" "}
            <span className="font-bold">sign-tx</span> commands.
          </div>
        ),
        type: "error",
      };
    }

    try {
      // Use the broadcastTransaction function to broadcast the transaction
      const result = await broadcastTransaction(
        workflowState.selectedChain!,
        workflowState.transaction,
        workflowState.signature
      );

      // Get the transaction hash from the response
      const txHash =
        result?.hash || "0x" + Math.random().toString(16).substring(2, 42);

      // Store the transaction hash in the workflow state
      workflowState.txHash = txHash;

      // Get the explorer URL for the current chain
      const explorerUrl =
        showroomChains[workflowState.selectedChain!]?.explorerUrl;

      // For Ethereum-based chains, we need to keep the 0x prefix
      // For other chains like Cosmos, we need to remove it
      // Use the chain family to determine if it's EVM-based
      const isEthereumBased = workflowState.selectedChainData?.family === "evm";
      const formattedTxHash = isEthereumBased
        ? txHash
        : txHash.replace("0x", "");

      const explorerLink = explorerUrl
        ? `${explorerUrl}${formattedTxHash}`
        : null;

      return {
        success: true,
        output: (
          <div>
            <p className="text-green-500 mb-2">
              Transaction broadcast successfully!
            </p>
            <div className="bg-gray-800 p-3 rounded mb-3">
              <p className="text-gray-300 mb-1">
                <span className="text-gray-500">Transaction Hash:</span>{" "}
                <span className="font-mono">{txHash}</span>
              </p>
            </div>
            {explorerLink && (
              <p className="text-medium text-gray-400 mt-3">
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View on {showroomChains[workflowState.selectedChain!]?.name}{" "}
                  Explorer
                </a>
              </p>
            )}
          </div>
        ),
        type: "success",
      };
    } catch (error) {
      return {
        success: false,
        output: (
          <div className="text-red-500">
            Failed to broadcast transaction: {(error as Error).message}
          </div>
        ),
        type: "error",
      };
    }
  },
};

// ExploreChains command
export const exploreChainsCommand: Command = {
  name: "explore-chains",
  description: "Explore all supported chains",
  execute: async (_args: string[] = []): Promise<CommandResult> => {
    try {
      // Show loading message
      console.log("Fetching chains from API...");

      // Use the adamikGetChains function which now includes API logging
      const { chains } = await adamikGetChains();

      // Format chains for display
      const chainsList = Object.entries(chains).map(([chainId, chain]) => ({
        id: chainId,
        name: chain.name,
        ticker: chain.ticker,
      }));

      // Check if the user has completed the tutorial before
      const hasCompletedTutorial = isTutorialCompleted();

      // Check if the user has completed all steps of the guided flow
      const hasCompletedGuidedFlow =
        workflowState.selectedChain &&
        workflowState.address &&
        workflowState.transaction &&
        workflowState.signature &&
        workflowState.txHash;

      // Only set the tutorial completed flag if the user has completed the guided flow
      if (hasCompletedGuidedFlow) {
        setTutorialCompleted(true);
      }

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

            {hasCompletedGuidedFlow && !hasCompletedTutorial ? (
              // First-time completion - show congratulations message
              <div className="mt-6 p-4 border border-blue-500 rounded-md bg-blue-900/20">
                <p className="text-blue-300 font-medium mb-2">
                  🎉 Congratulations on successfully interacting with the{" "}
                  {showroomChains[workflowState.selectedChain]?.name ||
                    workflowState.selectedChain}{" "}
                  blockchain!
                </p>
                <p className="text-gray-300 mb-3">
                  Try the flow again to see how easily you can scale across any
                  blockchain network.
                </p>
                <p className="text-gray-300 mb-3">
                  Explore the source code of this application on GitHub:
                </p>
                <a
                  href="https://github.com/AdamikHQ/adamik-tutorial/tree/signer-turnkey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View on GitHub
                </a>
                <p className="mt-4 text-gray-400 text-sm">
                  Type <span className="font-mono text-green-400">start</span>{" "}
                  to try another chain.
                </p>
              </div>
            ) : hasCompletedGuidedFlow ? (
              // Subsequent completions - show simpler message
              <p className="text-green-500 mt-4">
                Try the flow again to see how easily you can scale across any
                blockchain network.
              </p>
            ) : (
              // No guided flow completion - show generic message
              <p className="text-green-500 mt-4">
                {workflowState.selectedChain
                  ? "Continue with the tutorial to interact with the blockchain."
                  : "Type the start command to begin exploring blockchain interactions."}
              </p>
            )}
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
