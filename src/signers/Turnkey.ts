import { Turnkey } from "@turnkey/sdk-server";
import { apiLogsInstance } from "../adamik/apiLogsManager";
import {
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignerSpec,
} from "../adamik/types";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import {
  extractSignature,
  getCoinTypeFromDerivationPath,
  infoTerminal,
  italicInfoTerminal,
} from "../utils/utils";
import { BaseSigner } from "./types";

export class TurnkeySigner implements BaseSigner {
  private turnkeyClient: Turnkey;
  public chainId: string;
  public signerSpec: AdamikSignerSpec;
  public signerName = "TURNKEY";

  private pubKey: string | undefined;

  constructor(chainId: string, signerSpec: AdamikSignerSpec) {
    infoTerminal("Initializing Turnkey signer...", this.signerName);
    this.chainId = chainId;
    this.signerSpec = signerSpec;

    this.turnkeyClient = new Turnkey({
      apiBaseUrl: import.meta.env.VITE_TURNKEY_BASE_URL as string,
      apiPublicKey: import.meta.env.VITE_TURNKEY_API_PUBLIC_KEY as string,
      apiPrivateKey: import.meta.env.VITE_TURNKEY_API_PRIVATE_KEY as string,
      defaultOrganizationId: import.meta.env
        .VITE_TURNKEY_ORGANIZATION_ID as string,
    });
  }

  static isConfigValid(): boolean {
    if (!import.meta.env.VITE_TURNKEY_BASE_URL) {
      throw new Error("VITE_TURNKEY_BASE_URL is not set");
    }
    if (!import.meta.env.VITE_TURNKEY_API_PUBLIC_KEY) {
      throw new Error("VITE_TURNKEY_API_PUBLIC_KEY is not set");
    }
    if (!import.meta.env.VITE_TURNKEY_API_PRIVATE_KEY) {
      throw new Error("VITE_TURNKEY_API_PRIVATE_KEY is not set");
    }
    if (!import.meta.env.VITE_TURNKEY_ORGANIZATION_ID) {
      throw new Error("VITE_TURNKEY_ORGANIZATION_ID is not set");
    }
    if (!import.meta.env.VITE_TURNKEY_WALLET_ID) {
      throw new Error("VITE_TURNKEY_WALLET_ID is not set");
    }
    return true;
  }

  private convertAdamikCurveToTurnkeyCurve(
    curve: AdamikCurve
  ): "CURVE_SECP256K1" | "CURVE_ED25519" {
    switch (curve) {
      case AdamikCurve.SECP256K1:
        return "CURVE_SECP256K1";
      case AdamikCurve.ED25519:
        return "CURVE_ED25519";
      default:
        throw new Error(`Unsupported curve: ${curve}`);
    }
  }

  async getPubkey(): Promise<string> {
    console.log("TURNKEY WALLET ID", import.meta.env.VITE_TURNKEY_WALLET_ID);

    // Log the API call to get wallet accounts
    let getAccountsLogId = -1;
    if (apiLogsInstance) {
      const requestData = {
        walletId: import.meta.env.VITE_TURNKEY_WALLET_ID as string,
        paginationOptions: { limit: "100" },
      };
      getAccountsLogId = logApiCall(
        apiLogsInstance,
        "Turnkey",
        "/turnkey/get-wallet-accounts",
        "POST",
        requestData,
        "Get Wallet Accounts"
      );
    }

    try {
      const { accounts } = await this.turnkeyClient
        .apiClient()
        .getWalletAccounts({
          walletId: import.meta.env.VITE_TURNKEY_WALLET_ID as string,
          paginationOptions: {
            limit: "100",
          },
        });

      // Log success response
      if (apiLogsInstance && getAccountsLogId !== -1) {
        logApiResponse(
          apiLogsInstance,
          getAccountsLogId,
          "success",
          { accounts: accounts.length },
          "Wallet accounts retrieved"
        );
      }

      const coinType = getCoinTypeFromDerivationPath(
        this.signerSpec.derivationPath || ""
      );

      // Find the account with the matching path
      const account = accounts.find((acc) => acc.path.includes(coinType));

      if (!account) {
        throw new Error(
          `Account not found for coin type ${coinType} (path: ${this.signerSpec.derivationPath})`
        );
      }

      // Log the API call to get wallet account
      let getAccountLogId = -1;
      if (apiLogsInstance) {
        getAccountLogId = logApiCall(
          apiLogsInstance,
          "Turnkey",
          "/turnkey/get-wallet-account",
          "POST",
          { walletId: account.walletId, accountId: account.accountId },
          "Get Wallet Account Details"
        );
      }

      const accountDetails = await this.turnkeyClient
        .apiClient()
        .getWalletAccount({
          walletId: account.walletId,
          accountId: account.accountId,
        });

      // Log success response
      if (apiLogsInstance && getAccountLogId !== -1) {
        logApiResponse(
          apiLogsInstance,
          getAccountLogId,
          "success",
          { publicKey: accountDetails.account.publicKey },
          "Account details retrieved"
        );
      }

      const publicKey = accountDetails.account.publicKey;
      this.pubKey = publicKey;

      italicInfoTerminal(
        `Public key retrieved: ${publicKey.slice(0, 10)}...`,
        this.signerName
      );

      return publicKey;
    } catch (error) {
      // Log error response
      if (apiLogsInstance && getAccountsLogId !== -1) {
        logApiResponse(
          apiLogsInstance,
          getAccountsLogId,
          "error",
          error,
          "Failed to get wallet accounts"
        );
      }
      console.error("Error getting wallet accounts:", error);
      throw error;
    }
  }

  async signTransaction(
    encoded: any[],
    hashFunc: AdamikHashFunction
  ): Promise<string> {
    // For ED25519 curves (TON, Aptos, etc.), we don't use hash function
    const isEd25519 = this.signerSpec.curve === AdamikCurve.ED25519;

    // Extract the hash from the encoded transaction
    let hashToSign = "";
    if (encoded && encoded.length > 0) {
      if (encoded[0]?.hash?.value) {
        // TON structure
        hashToSign = encoded[0].hash.value;
      } else if (encoded[0]?.raw?.value) {
        // Aptos structure
        hashToSign = encoded[0].raw.value;
      } else if (typeof encoded[0] === "string") {
        hashToSign = encoded[0];
      } else {
        console.error("Unexpected encoded structure:", encoded);
        throw new Error("Unable to extract hash from encoded transaction");
      }
    }

    return this.signHash(hashToSign);
  }

  async signHash(hash: string): Promise<string> {
    if (!this.pubKey) {
      await this.getPubkey();
    }

    const walletId = import.meta.env.VITE_TURNKEY_WALLET_ID as string;

    // Log the API call
    let logId = -1;
    if (apiLogsInstance) {
      const requestData = {
        walletId,
        hash,
        curve: this.signerSpec.curve,
      };
      logId = logApiCall(
        apiLogsInstance,
        "Turnkey",
        "/turnkey/sign-raw-payload",
        "POST",
        requestData,
        "Signing Transaction"
      );
    }

    try {
      italicInfoTerminal(
        `Signing transaction with Turnkey...`,
        this.signerName
      );

      const signResult = await this.turnkeyClient
        .apiClient()
        .signRawPayload({
          walletId,
          signWith: this.pubKey!,
          payload: hash,
          hashFunction: "HASH_FUNCTION_NOT_APPLICABLE",
          encoding: "ENCODING_HEX",
        });

      // Log success response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          "success",
          { signature: signResult.signature },
          "Transaction signed"
        );
      }

      italicInfoTerminal(
        `Transaction signed successfully`,
        this.signerName
      );

      // Extract the signature using the utility function
      const signature = extractSignature(signResult.signature);
      return signature;
    } catch (error) {
      // Log error response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          "error",
          error,
          "Failed to sign transaction"
        );
      }
      console.error("Error signing transaction:", error);
      throw error;
    }
  }
}