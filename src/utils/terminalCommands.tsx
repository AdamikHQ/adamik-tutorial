import { CommandResult, workflowState } from "./terminalTypes";
import {
  helpCommand,
  clearCommand,
  getChainsCommand,
  startCommand,
  chainCommand,
} from "./commands";
import { SodotSigner } from "../signers/Sodot";
import { encodePubKeyToAddress } from "../adamik/encodePubkeyToAddress";
import { getAccountState } from "../adamik/getAccountState";
import { infoTerminal } from "./utils";
import { renderChainInfo } from "./chainRenderer";

// Collect all commands
const commands = {
  help: helpCommand,
  clear: clearCommand,
  getChains: getChainsCommand,
  start: startCommand,
  chain: chainCommand,
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
      commandName !== "clear" &&
      commandName !== "getchains" &&
      commandName !== "chain"
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
