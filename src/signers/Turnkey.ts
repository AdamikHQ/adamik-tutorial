import { Turnkey } from "@turnkey/sdk-server";
import {
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignerSpec,
} from "../adamik/types";
import {
  extractSignature,
  getCoinTypeFromDerivationPath,
  infoTerminal,
  italicInfoTerminal,
} from "../utils";
import { Signer } from "./index";
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
    const { accounts } = await this.turnkeyClient
      .apiClient()
      .getWalletAccounts({
        walletId: import.meta.env.VITE_TURNKEY_WALLET_ID as string,
      });

    const accountCompressed = accounts.find(
      (account) =>
        account.curve ===
          this.convertAdamikCurveToTurnkeyCurve(this.signerSpec.curve) &&
        getCoinTypeFromDerivationPath(account.path) ===
          Number(this.signerSpec.coinType) &&
        account.addressFormat === "ADDRESS_FORMAT_COMPRESSED"
    );

    if (!accountCompressed) {
      const createAccount = await this.turnkeyClient
        .apiClient()
        .createWalletAccounts({
          walletId: import.meta.env.VITE_TURNKEY_WALLET_ID as string,
          accounts: [
            {
              curve: this.convertAdamikCurveToTurnkeyCurve(
                this.signerSpec.curve
              ),
              path: `m/44'/${this.signerSpec.coinType}'/0'/0/0`,
              pathFormat: "PATH_FORMAT_BIP32",
              addressFormat: "ADDRESS_FORMAT_COMPRESSED",
            },
          ],
        });

      this.pubKey = createAccount.addresses[0];

      return createAccount.addresses[0];
    }
    this.pubKey = accountCompressed.address;

    return accountCompressed.address;
  }

  private convertHashFunctionToTurnkeyHashFunction(
    hashFunction: AdamikHashFunction,
    curve: AdamikCurve
  ) {
    if (curve === AdamikCurve.ED25519) {
      return "HASH_FUNCTION_NOT_APPLICABLE";
    }

    // https://docs.turnkey.com/faq#what-does-hash_function_no_op-mean
    switch (hashFunction) {
      case AdamikHashFunction.SHA256:
        return "HASH_FUNCTION_SHA256";
      case AdamikHashFunction.KECCAK256:
        return "HASH_FUNCTION_KECCAK256";
      default:
        return "HASH_FUNCTION_NOT_APPLICABLE";
    }
  }

  public async signTransaction(encodedMessage: string): Promise<string> {
    if (!this.pubKey) {
      this.pubKey = await this.getPubkey();
    }

    const txSignResult = await this.turnkeyClient.apiClient().signRawPayload({
      signWith: this.pubKey,
      payload: encodedMessage,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: this.convertHashFunctionToTurnkeyHashFunction(
        this.signerSpec.hashFunction,
        this.signerSpec.curve
      ),
    });

    infoTerminal(`Signature`);
    await italicInfoTerminal(
      JSON.stringify(
        { r: txSignResult.r, s: txSignResult.s, v: txSignResult.v },
        null,
        2
      )
    );

    return extractSignature(this.signerSpec.signatureFormat, txSignResult);
  }
}
