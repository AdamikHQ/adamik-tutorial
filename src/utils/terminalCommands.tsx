import { CommandResult, workflowState } from "./terminalTypes";
import {
  helpCommand,
  clearCommand,
  startCommand,
  prepareTxCommand,
  signTxCommand,
  broadcastTxCommand,
  exploreChainsCommand,
} from "./commands";
import { SodotSigner } from "../signers/Sodot";
import { encodePubKeyToAddress } from "../adamik/encodePubkeyToAddress";
import { getAccountState } from "../adamik/getAccountState";
import { infoTerminal } from "./utils";
import { renderChainInfo } from "./chainRenderer";
import { adamikGetChain } from "../adamik/getChain";

// Collect all commands
const commands = {
  help: helpCommand,
  clear: clearCommand,
  start: startCommand,
  "prepare-tx": prepareTxCommand,
  "sign-tx": signTxCommand,
  "broadcast-tx": broadcastTxCommand,
  "explore-chains": exploreChainsCommand,
};

// Restricted initial commands
const initialCommands = {
  help: helpCommand,
  start: startCommand,
  clear: clearCommand,
  "explore-chains": exploreChainsCommand,
};

// Function to update terminal output with progress
const updateTerminalWithProgress = (
  commandId: number,
  setCommandHistory: React.Dispatch<React.SetStateAction<any[]>>,
  output: React.ReactNode
) => {
  setCommandHistory((prev) => {
    const updatedHistory = [...prev];
    const commandIndex = updatedHistory.findIndex(
      (cmd) => cmd.id === commandId
    );
    if (commandIndex !== -1) {
      updatedHistory[commandIndex] = {
        ...updatedHistory[commandIndex],
        output,
      };
    }
    return updatedHistory;
  });
};

// Main function to execute commands
export const executeCommand = async (
  input: string,
  commandId?: number,
  setCommandHistory?: React.Dispatch<React.SetStateAction<any[]>>
): Promise<CommandResult> => {
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

      // Get chain IDs from session storage
      const chainIdsJson = sessionStorage.getItem("adamikChainIds");
      if (!chainIdsJson) {
        return {
          success: false,
          output: 'No chains data available. Please run "start" again.',
          type: "error",
        };
      }

      const chainIds = JSON.parse(chainIdsJson);

      if (!chainIds.includes(chainId)) {
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

      try {
        // Initial output - starting the process
        let currentOutput = (
          <div>
            <p className="text-gray-400">Processing chain selection...</p>
          </div>
        );

        // Update terminal if we have the setter function
        if (commandId && setCommandHistory) {
          updateTerminalWithProgress(
            commandId,
            setCommandHistory,
            currentOutput
          );
        }

        // Step 1: Fetch chain details from API
        console.log(`Fetching chain information for ${chainId}...`);
        const chain = await adamikGetChain(chainId);

        // Store chain details in workflow state
        workflowState.selectedChain = chainId;
        workflowState.selectedChainData = chain;

        // Update output with chain info retrieved
        currentOutput = (
          <div>
            <div className="mb-6 space-y-2">
              <p className="text-green-400 font-bold">
                ✓ Chain information retrieved
              </p>
            </div>
          </div>
        );

        // Update terminal if we have the setter function
        if (commandId && setCommandHistory) {
          updateTerminalWithProgress(
            commandId,
            setCommandHistory,
            currentOutput
          );
        }

        // Step 2: Create SodotSigner instance and generate pubkey
        const signer = new SodotSigner(chainId, chain.signerSpec);
        infoTerminal(`Generating keys for ${chain.name}...`, "TERMINAL");
        const pubkey = await signer.getPubkey();
        if (!pubkey) {
          throw new Error("Failed to generate public key");
        }
        workflowState.pubkey = pubkey;

        // Update output with pubkey generated
        currentOutput = (
          <div>
            <div className="mb-6 space-y-2">
              <p className="text-green-400 font-bold">
                ✓ Chain information retrieved
              </p>
              <p className="text-green-400 font-bold">
                ✓ Public keys generated
              </p>
            </div>
          </div>
        );

        // Update terminal if we have the setter function
        if (commandId && setCommandHistory) {
          updateTerminalWithProgress(
            commandId,
            setCommandHistory,
            currentOutput
          );
        }

        // Step 3: Get address from pubkey
        const addressInfo = await encodePubKeyToAddress(pubkey, chainId);
        if (!addressInfo || !addressInfo.address) {
          throw new Error("Failed to generate address from public key");
        }
        workflowState.address = addressInfo.address;

        // Update output with address retrieved
        currentOutput = (
          <div>
            <div className="mb-6 space-y-2">
              <p className="text-green-400 font-bold">
                ✓ Chain information retrieved
              </p>
              <p className="text-green-400 font-bold">
                ✓ Public keys generated
              </p>
              <p className="text-green-400 font-bold">
                ✓ Address for {chain.name} retrieved
              </p>
            </div>
          </div>
        );

        // Update terminal if we have the setter function
        if (commandId && setCommandHistory) {
          updateTerminalWithProgress(
            commandId,
            setCommandHistory,
            currentOutput
          );
        }

        // For Bitcoin, we need to select which address format to use for balance
        let addressToCheck = addressInfo.address;
        if (
          chainId === "bitcoin" &&
          addressInfo.allAddresses &&
          addressInfo.allAddresses.length > 0
        ) {
          // Prefer p2wpkh (native segwit) if available
          const p2wpkhAddress = addressInfo.allAddresses.find(
            (addr) => addr.type === "p2wpkh"
          );
          if (p2wpkhAddress) {
            addressToCheck = p2wpkhAddress.address;
            console.log(
              `Using p2wpkh address for Bitcoin balance check: ${addressToCheck}`
            );
          }
        }

        // Fetch balance information
        let balance;
        try {
          console.log(`Fetching balance for ${chainId}:${addressToCheck}`);
          balance = await getAccountState(chainId, addressToCheck);

          // Check if the balance has the expected structure
          if (!balance || !balance.balances) {
            console.warn(
              "Balance response doesn't have expected structure:",
              balance
            );
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

        // Clear the chain selection state
        sessionStorage.removeItem("lastCommandResult");

        // Render chain information
        return {
          success: true,
          output: renderChainInfo(chainId, chain, pubkey, addressInfo, balance),
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

  // Check if help has been executed before
  const helpExecuted = sessionStorage.getItem("helpExecuted") === "true";

  // Check if a chain has been selected (completed the start flow)
  const chainSelected =
    workflowState.selectedChain !== null &&
    workflowState.selectedChain !== undefined;

  // If a chain has been selected, allow all commands even if help hasn't been executed
  const availableCommands =
    helpExecuted || chainSelected ? commands : initialCommands;

  const command = Object.values(availableCommands).find(
    (cmd) => cmd.name.toLowerCase() === commandName
  );

  if (!command) {
    // If command not found in available commands
    if (
      !helpExecuted &&
      !chainSelected &&
      commandName !== "help" &&
      commandName !== "start" &&
      commandName !== "explore-chains"
    ) {
      return {
        success: false,
        output: `Command not available. Only "help", "start", and "clear" commands are available initially. Type "help" to see all available commands.`,
        type: "error",
      };
    } else {
      return {
        success: false,
        output: `Command not found: ${commandName}. Type "help" to see available commands.`,
        type: "error",
      };
    }
  }

  try {
    // If executing help command, mark it as executed
    if (commandName === "help") {
      sessionStorage.setItem("helpExecuted", "true");
    }

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
