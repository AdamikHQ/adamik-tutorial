import React from "react";
import { AdamikChain } from "../adamik/types";
import { SodotSigner } from "../signers/Sodot";
import { encodePubKeyToAddress } from "../adamik/encodePubkeyToAddress";
import { getAccountState } from "../adamik/getAccountState";
import { infoTerminal } from "./utils";

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
              <strong>balance</strong> - Check balance and state of an address
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

  balance: {
    name: "balance",
    description: "Check balance and state of an address",
    execute: async (args: string[] = []): Promise<CommandResult> => {
      try {
        if (!workflowState.selectedChain || !workflowState.selectedChainData) {
          return {
            success: false,
            output: 'Please select a chain first using the "start" command.',
            type: "error",
          };
        }

        const address = args[0];
        if (!address) {
          return {
            success: false,
            output: "Please provide an address to check.",
            type: "error",
          };
        }

        const chain = workflowState.selectedChainData;
        const chainId = workflowState.selectedChain;

        const balance = await getAccountState(chainId, address);

        // Format the native balance
        const formattedNativeBalance = (
          Number(balance.balances.native.available) /
          Math.pow(10, chain.decimals)
        ).toFixed(chain.decimals);

        return {
          success: true,
          output: (
            <div>
              <div className="bg-gray-800 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-yellow-400">
                  Account Information
                </h3>
                <div className="grid gap-2">
                  <p>
                    <strong>Chain:</strong> {chain.name} ({chainId})
                  </p>
                  <p>
                    <strong>Address:</strong>
                    <div className="font-mono text-sm break-all bg-black p-2 rounded mt-1">
                      {address}
                    </div>
                  </p>
                  <div>
                    <strong>Native Balance:</strong>
                    <div className="grid grid-cols-2 gap-2 ml-4 mt-1">
                      <p>
                        Available: {formattedNativeBalance} {chain.ticker}
                      </p>
                      <p>
                        Total:{" "}
                        {(
                          Number(balance.balances.native.total) /
                          Math.pow(10, chain.decimals)
                        ).toFixed(chain.decimals)}{" "}
                        {chain.ticker}
                      </p>
                      {balance.balances.native.unconfirmed !== "0" &&
                        !isNaN(Number(balance.balances.native.unconfirmed)) && (
                          <p>
                            Unconfirmed:{" "}
                            {(
                              Number(balance.balances.native.unconfirmed) /
                              Math.pow(10, chain.decimals)
                            ).toFixed(chain.decimals)}{" "}
                            {chain.ticker}
                          </p>
                        )}
                    </div>
                  </div>
                  {balance.balances.tokens.length > 0 && (
                    <div>
                      <strong>Tokens:</strong>
                      <div className="ml-4 mt-1">
                        {balance.balances.tokens.map((token, index) => (
                          <div key={index} className="mb-2">
                            <p>
                              {token.token.name} ({token.token.ticker})
                            </p>
                            <p className="text-sm text-gray-400">
                              Amount:{" "}
                              {(
                                Number(token.amount) /
                                Math.pow(10, Number(token.token.decimals))
                              ).toFixed(Number(token.token.decimals))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {balance.balances.staking && (
                    <div>
                      <strong>Staking:</strong>
                      <div className="grid gap-1 ml-4 mt-1">
                        <p>
                          Total:{" "}
                          {(
                            Number(balance.balances.staking.total) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        <p>
                          Locked:{" "}
                          {(
                            Number(balance.balances.staking.locked) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        <p>
                          Unlocking:{" "}
                          {(
                            Number(balance.balances.staking.unlocking) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        <p>
                          Unlocked:{" "}
                          {(
                            Number(balance.balances.staking.unlocked) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        {balance.balances.staking.positions.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold">Staking Positions:</p>
                            <div className="ml-4">
                              {balance.balances.staking.positions.map(
                                (pos, index) => (
                                  <div
                                    key={index}
                                    className="mb-2 bg-black p-2 rounded"
                                  >
                                    <p>
                                      Amount:{" "}
                                      {(
                                        Number(pos.amount) /
                                        Math.pow(10, chain.decimals)
                                      ).toFixed(chain.decimals)}{" "}
                                      {chain.ticker}
                                    </p>
                                    <p>Status: {pos.status}</p>
                                    <p>
                                      Completion:{" "}
                                      {new Date(
                                        pos.completionDate * 1000
                                      ).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Validators:{" "}
                                      {pos.validatorAddresses.join(", ")}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {(balance.balances.staking.rewards.native.length > 0 ||
                          balance.balances.staking.rewards.tokens.length >
                            0) && (
                          <div className="mt-2">
                            <p className="font-semibold">Rewards:</p>
                            <div className="ml-4">
                              {balance.balances.staking.rewards.native.map(
                                (reward, index) => (
                                  <div key={index} className="mb-1">
                                    <p>
                                      {(
                                        Number(reward.amount) /
                                        Math.pow(10, chain.decimals)
                                      ).toFixed(chain.decimals)}{" "}
                                      {chain.ticker}
                                      <span className="text-sm text-gray-400">
                                        {" "}
                                        from {reward.validatorAddress}
                                      </span>
                                    </p>
                                  </div>
                                )
                              )}
                              {balance.balances.staking.rewards.tokens.map(
                                (reward, index) => (
                                  <div key={index} className="mb-1">
                                    <p>
                                      {(
                                        Number(reward.amount) /
                                        Math.pow(
                                          10,
                                          Number(reward.token.decimals)
                                        )
                                      ).toFixed(
                                        Number(reward.token.decimals)
                                      )}{" "}
                                      {reward.token.ticker}
                                      <span className="text-sm text-gray-400">
                                        {" "}
                                        from {reward.validatorAddress}
                                      </span>
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
          type: "success",
        };
      } catch (error) {
        console.error("Error fetching account state:", error);
        return {
          success: false,
          output: (
            <div>
              <p className="text-red-400 mb-2">
                Failed to fetch account state!
              </p>
              <p>
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred"}
              </p>
            </div>
          ),
          type: "error",
        };
      }
    },
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

      // Chain found, store in workflow state
      const chain = chains[chainId];
      workflowState.selectedChain = chainId;
      workflowState.selectedChainData = chain;

      try {
        // Create SodotSigner instance and generate pubkey
        const signer = new SodotSigner(chainId, chain.signerSpec);
        infoTerminal(`Generating keys for ${chain.name}...`, "TERMINAL");
        const pubkey = await signer.getPubkey();
        if (!pubkey) {
          throw new Error("Failed to generate public key");
        }
        workflowState.pubkey = pubkey;

        // Get address from pubkey
        const addressInfo = await encodePubKeyToAddress(pubkey, chainId);
        if (!addressInfo || !addressInfo.address) {
          throw new Error("Failed to generate address from public key");
        }
        workflowState.address = addressInfo.address;

        // Fetch balance information
        let balance;
        try {
          const balance = await getAccountState(chainId, addressInfo.address);
        } catch (error) {
          console.warn("Failed to fetch balance:", error);
          balance = {
            balances: {
              native: {
                available: "0",
                total: "0",
                unconfirmed: "0",
              },
              tokens: [],
              staking: null,
            },
          };
        }

        const formattedNativeBalance = (
          Number(balance.balances.native.available) /
          Math.pow(10, chain.decimals)
        ).toFixed(chain.decimals);

        // Clear the chain selection state
        sessionStorage.removeItem("lastCommandResult");

        return {
          success: true,
          output: (
            <div>
              <p className="mb-4 text-green-400 font-bold">
                ✓ Chain selected and keys generated!
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
              <div className="bg-gray-800 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-yellow-400">
                  Key Details (SODOT MPC)
                </h3>
                <div>
                  <div className="mb-2">
                    <strong>Public Key:</strong>
                    <div className="font-mono text-sm break-all bg-black p-2 rounded mt-1">
                      {pubkey}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong> ({addressInfo.type})
                    <div className="font-mono text-sm break-all bg-black p-2 rounded mt-1">
                      {addressInfo.address}
                    </div>
                  </div>
                  {addressInfo.allAddresses.length > 1 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Other available address formats:
                      </p>
                      <ul className="list-disc ml-4 text-sm text-gray-400">
                        {addressInfo.allAddresses.slice(1).map((addr) => (
                          <li key={addr.address}>
                            {addr.type}: {addr.address}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-yellow-400">
                  Account Information
                </h3>
                <div className="grid gap-2">
                  <div>
                    <strong>Native Balance:</strong>
                    <div className="grid grid-cols-2 gap-2 ml-4 mt-1">
                      <p>
                        Available: {formattedNativeBalance} {chain.ticker}
                      </p>
                      <p>
                        Total:{" "}
                        {(
                          Number(balance.balances.native.total) /
                          Math.pow(10, chain.decimals)
                        ).toFixed(chain.decimals)}{" "}
                        {chain.ticker}
                      </p>
                      {balance.balances.native.unconfirmed !== "0" &&
                        !isNaN(Number(balance.balances.native.unconfirmed)) && (
                          <p>
                            Unconfirmed:{" "}
                            {(
                              Number(balance.balances.native.unconfirmed) /
                              Math.pow(10, chain.decimals)
                            ).toFixed(chain.decimals)}{" "}
                            {chain.ticker}
                          </p>
                        )}
                    </div>
                  </div>
                  {balance.balances.tokens.length > 0 && (
                    <div>
                      <strong>Tokens:</strong>
                      <div className="ml-4 mt-1">
                        {balance.balances.tokens.map((token, index) => (
                          <div key={index} className="mb-2">
                            <p>
                              {token.token.name} ({token.token.ticker})
                            </p>
                            <p className="text-sm text-gray-400">
                              Amount:{" "}
                              {(
                                Number(token.amount) /
                                Math.pow(10, Number(token.token.decimals))
                              ).toFixed(Number(token.token.decimals))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {balance.balances.staking && (
                    <div>
                      <strong>Staking:</strong>
                      <div className="grid gap-1 ml-4 mt-1">
                        <p>
                          Total:{" "}
                          {(
                            Number(balance.balances.staking.total) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        <p>
                          Locked:{" "}
                          {(
                            Number(balance.balances.staking.locked) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        <p>
                          Unlocking:{" "}
                          {(
                            Number(balance.balances.staking.unlocking) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        <p>
                          Unlocked:{" "}
                          {(
                            Number(balance.balances.staking.unlocked) /
                            Math.pow(10, chain.decimals)
                          ).toFixed(chain.decimals)}{" "}
                          {chain.ticker}
                        </p>
                        {balance.balances.staking.positions.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold">Staking Positions:</p>
                            <div className="ml-4">
                              {balance.balances.staking.positions.map(
                                (pos, index) => (
                                  <div
                                    key={index}
                                    className="mb-2 bg-black p-2 rounded"
                                  >
                                    <p>
                                      Amount:{" "}
                                      {(
                                        Number(pos.amount) /
                                        Math.pow(10, chain.decimals)
                                      ).toFixed(chain.decimals)}{" "}
                                      {chain.ticker}
                                    </p>
                                    <p>Status: {pos.status}</p>
                                    <p>
                                      Completion:{" "}
                                      {new Date(
                                        pos.completionDate * 1000
                                      ).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Validators:{" "}
                                      {pos.validatorAddresses.join(", ")}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {(balance.balances.staking.rewards.native.length > 0 ||
                          balance.balances.staking.rewards.tokens.length >
                            0) && (
                          <div className="mt-2">
                            <p className="font-semibold">Rewards:</p>
                            <div className="ml-4">
                              {balance.balances.staking.rewards.native.map(
                                (reward, index) => (
                                  <div key={index} className="mb-1">
                                    <p>
                                      {(
                                        Number(reward.amount) /
                                        Math.pow(10, chain.decimals)
                                      ).toFixed(chain.decimals)}{" "}
                                      {chain.ticker}
                                      <span className="text-sm text-gray-400">
                                        {" "}
                                        from {reward.validatorAddress}
                                      </span>
                                    </p>
                                  </div>
                                )
                              )}
                              {balance.balances.staking.rewards.tokens.map(
                                (reward, index) => (
                                  <div key={index} className="mb-1">
                                    <p>
                                      {(
                                        Number(reward.amount) /
                                        Math.pow(
                                          10,
                                          Number(reward.token.decimals)
                                        )
                                      ).toFixed(
                                        Number(reward.token.decimals)
                                      )}{" "}
                                      {reward.token.ticker}
                                      <span className="text-sm text-gray-400">
                                        {" "}
                                        from {reward.validatorAddress}
                                      </span>
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
      } catch (error) {
        console.error("Error generating keys:", error);
        return {
          success: false,
          output: (
            <div>
              <p className="text-red-400 mb-2">
                Chain selected but failed to generate keys!
              </p>
              <p>{error instanceof Error ? error.message : "Unknown error"}</p>
              <p className="mt-2 text-xs text-gray-400">
                Make sure your SODOT configuration is correct in your .env.local
                file.
              </p>
            </div>
          ),
          type: "error",
        };
      }
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
