import { HDNodeWallet, ethers } from "ethers";
import {
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignerSpec,
} from "../adamik/types";
import { extractSignature, infoTerminal } from "../utils";
import { BaseSigner } from "./types";
import * as nacl from "tweetnacl";
import { ec } from "starknet";
import { Bip39, Slip10, Slip10Curve, stringToPath } from "@cosmjs/crypto";

/**
 * LocalSigner implements key derivation and signing for multiple curves:
 *
 * SECP256K1: Using ethers.js HD wallet (BIP32/BIP39/BIP44)
 *   - Industry standard implementation
 *   - Well tested with Ethereum and Bitcoin
 *
 * ED25519: Using chain-specific derivation
 *   - Direct seed for TON and similar chains
 *   - SLIP-0010 for chains that follow BIP32-ED25519
 *   - Compatible with hardware wallets
 *
 * STARK: Using starknet.js
 *   - Official StarkNet implementation
 *   - Handles curve-specific requirements
 */

// Define chains that use direct seed instead of SLIP-0010
const DIRECT_SEED_CHAINS = ["607"]; // TON

export class LocalSigner implements BaseSigner {
  private wallet: HDNodeWallet | null = null;
  private ed25519KeyPair: nacl.SignKeyPair | null = null;
  private starkPrivateKey: string | null = null;
  public signerName = "LOCAL_UNSECURE";

  constructor(public chainId: string, public signerSpec: AdamikSignerSpec) {
    if (!process.env.UNSECURE_LOCAL_SEED) {
      throw new Error(
        "UNSECURE_LOCAL_SEED is not set in environment variables"
      );
    }
  }

  static isConfigValid(): boolean {
    return !!process.env.UNSECURE_LOCAL_SEED;
  }

  private async getSecp256k1Wallet(): Promise<HDNodeWallet> {
    if (!this.wallet) {
      const masterNode = ethers.HDNodeWallet.fromPhrase(
        process.env.UNSECURE_LOCAL_SEED!
      );

      const derivationPath = `44'/${this.signerSpec.coinType}'/0'/0/0`;
      this.wallet = masterNode.derivePath(derivationPath);
    }
    return this.wallet;
  }

  private async getEd25519KeyPair(): Promise<nacl.SignKeyPair> {
    if (!this.ed25519KeyPair) {
      if (this.signerSpec.coinType === "607") {
        const tonMnemonic = require("tonweb-mnemonic");
        const words = process.env.UNSECURE_LOCAL_SEED!.split(" ");

        const seed = await tonMnemonic.mnemonicToSeed(words);
        this.ed25519KeyPair = nacl.sign.keyPair.fromSeed(seed);
      } else {
        const words = process.env.UNSECURE_LOCAL_SEED!.split(" ");
        const tonMnemonic = require("tonweb-mnemonic");
        const seed = await tonMnemonic.mnemonicToSeed(words);

        const hdPath = stringToPath(
          `m/44'/${this.signerSpec.coinType}'/0'/0'/0'`
        );
        const { privkey } = Slip10.derivePath(
          Slip10Curve.Ed25519,
          seed,
          hdPath
        );
        this.ed25519KeyPair = nacl.sign.keyPair.fromSeed(Buffer.from(privkey));
      }
    }
    return this.ed25519KeyPair;
  }

  private async getStarkPrivateKey(): Promise<string> {
    if (!this.starkPrivateKey) {
      const masterNode = ethers.HDNodeWallet.fromPhrase(
        process.env.UNSECURE_LOCAL_SEED!
      );
      const path = `44'/${this.signerSpec.coinType}'/0'/0/0`;
      const derived = masterNode.derivePath(path);

      const hashedKey = ethers.sha256(derived.privateKey);
      const keyBigInt = BigInt(hashedKey);
      const starkCurveOrder = BigInt(
        "3618502788666131213697322783095070105526743751716087489154079457884512865583"
      );
      const validKey = (
        (keyBigInt % (starkCurveOrder - BigInt(1))) +
        BigInt(1)
      ).toString(16);

      this.starkPrivateKey = validKey.padStart(64, "0");
    }
    return this.starkPrivateKey;
  }

  async getPubkey(): Promise<string> {
    switch (this.signerSpec.curve) {
      case AdamikCurve.SECP256K1: {
        const wallet = await this.getSecp256k1Wallet();
        return wallet.publicKey.slice(2); // Remove '0x' prefix
      }
      case AdamikCurve.ED25519: {
        const keyPair = await this.getEd25519KeyPair();
        return Buffer.from(keyPair.publicKey).toString("hex");
      }
      case AdamikCurve.STARK: {
        const privateKey = await this.getStarkPrivateKey();
        return ec.starkCurve.getStarkKey(privateKey);
      }
      default:
        throw new Error(`Unsupported curve: ${this.signerSpec.curve}`);
    }
  }

  private padTo32Bytes(input: string): Buffer {
    const hex = input.startsWith("0x") ? input.slice(2) : input;
    const buffer = Buffer.from(hex.padStart(64, "0"), "hex");
    return buffer;
  }

  async signTransaction(encodedMessage: string): Promise<string> {
    infoTerminal(
      `Signing message with ${this.signerSpec.curve}`,
      this.signerName
    );

    const messageBytes = Buffer.from(encodedMessage, "hex");

    let messageHash: Buffer;
    switch (this.signerSpec.hashFunction) {
      case AdamikHashFunction.SHA256:
        messageHash = Buffer.from(ethers.sha256(messageBytes).slice(2), "hex");
        break;
      case AdamikHashFunction.KECCAK256:
        messageHash = Buffer.from(
          ethers.keccak256(messageBytes).slice(2),
          "hex"
        );
        break;
      case AdamikHashFunction.SHA512_256:
        throw new Error("SHA512_256 not implemented");
      case AdamikHashFunction.PEDERSEN: {
        const x = messageBytes;
        const y = Buffer.from("00", "hex");
        const pedersenHash = ec.starkCurve.pedersen(x, y);
        messageHash = Buffer.from(pedersenHash.slice(2), "hex");
        break;
      }
      default:
        throw new Error(
          `Unsupported hash function: ${this.signerSpec.hashFunction}`
        );
    }

    switch (this.signerSpec.curve) {
      case AdamikCurve.SECP256K1: {
        const wallet = await this.getSecp256k1Wallet();
        const sig = wallet.signingKey.sign(messageHash);

        return extractSignature(this.signerSpec.signatureFormat, {
          r: sig.r.slice(2),
          s: sig.s.slice(2),
          v: sig.v.toString(16),
        });
      }
      case AdamikCurve.ED25519: {
        const keyPair = await this.getEd25519KeyPair();
        const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);

        return extractSignature(this.signerSpec.signatureFormat, {
          r: Buffer.from(signature.slice(0, 32)).toString("hex"),
          s: Buffer.from(signature.slice(32, 64)).toString("hex"),
        });
      }
      case AdamikCurve.STARK: {
        const privateKey = await this.getStarkPrivateKey();
        const signature = ec.starkCurve.sign(messageHash, privateKey);
        return extractSignature(this.signerSpec.signatureFormat, {
          r: signature.r.toString(16),
          s: signature.s.toString(16),
        });
      }
      default:
        throw new Error(`Unsupported curve: ${this.signerSpec.curve}`);
    }
  }

  private hashMessage(message: string): string {
    const input = message.startsWith("0x") ? message : "0x" + message;
    return this.signerSpec.hashFunction === AdamikHashFunction.SHA256
      ? ethers.sha256(input)
      : ethers.keccak256(input);
  }
}
