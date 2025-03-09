import { HDNodeWallet, ethers } from "ethers";
import {
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignatureFormat,
  AdamikSignerSpec,
} from "../adamik/types";
import { extractSignature, infoTerminal } from "../utils/utils";
import * as nacl from "tweetnacl";
import { ec } from "starknet";
import { Slip10, Slip10Curve, stringToPath } from "@cosmjs/crypto";
import { BaseSigner } from "./types";
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

// Helper functions for hex string handling
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class LocalSigner implements BaseSigner {
  private wallet: HDNodeWallet | null = null;
  private ed25519KeyPair: nacl.SignKeyPair | null = null;
  private starkPrivateKey: string | null = null;
  public signerName = "LOCAL_UNSECURE";

  constructor(public chainId: string, public signerSpec: AdamikSignerSpec) {
    if (!import.meta.env.VITE_UNSECURE_LOCAL_SEED) {
      throw new Error(
        "VITE_UNSECURE_LOCAL_SEED is not set in your .env.local file"
      );
    }
  }

  static isConfigValid(): boolean {
    return !!import.meta.env.VITE_UNSECURE_LOCAL_SEED;
  }

  private async getSecp256k1Wallet(): Promise<HDNodeWallet> {
    if (!this.wallet) {
      const masterNode = ethers.HDNodeWallet.fromPhrase(
        import.meta.env.VITE_UNSECURE_LOCAL_SEED!
      );
      const derivationPath = `44'/${this.signerSpec.coinType}'/0'/0/0`;
      this.wallet = masterNode.derivePath(derivationPath);
    }
    return this.wallet;
  }

  private async getEd25519KeyPair(): Promise<nacl.SignKeyPair> {
    if (!this.ed25519KeyPair) {
      const masterNode = ethers.HDNodeWallet.fromPhrase(
        import.meta.env.VITE_UNSECURE_LOCAL_SEED!
      );

      if (this.signerSpec.coinType === "607") {
        const seed = hexToBytes(masterNode.privateKey.slice(2));
        this.ed25519KeyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
      } else {
        const hdPath = stringToPath(
          `44'/${this.signerSpec.coinType}'/0'/0'/0'`
        );
        const { privkey } = Slip10.derivePath(
          Slip10Curve.Ed25519,
          hexToBytes(masterNode.privateKey.slice(2)),
          hdPath
        );
        this.ed25519KeyPair = nacl.sign.keyPair.fromSeed(privkey);
      }
    }
    return this.ed25519KeyPair;
  }

  private async getStarkPrivateKey(): Promise<string> {
    if (!this.starkPrivateKey) {
      const masterNode = ethers.HDNodeWallet.fromPhrase(
        import.meta.env.VITE_UNSECURE_LOCAL_SEED!
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
        return bytesToHex(keyPair.publicKey);
      }
      case AdamikCurve.STARK: {
        const privateKey = await this.getStarkPrivateKey();
        return ec.starkCurve.getStarkKey(privateKey);
      }
      default:
        throw new Error(`Unsupported curve: ${this.signerSpec.curve}`);
    }
  }

  private padTo32Bytes(input: string): Uint8Array {
    const hex = input.startsWith("0x") ? input.slice(2) : input;
    const bytes = new Uint8Array(32);
    const inputBytes = hexToBytes(hex.padStart(64, "0"));
    bytes.set(inputBytes);
    return bytes;
  }

  async signTransaction(encodedMessage: string): Promise<string> {
    infoTerminal(
      `Signing message with ${this.signerSpec.curve}`,
      this.signerName
    );

    const messageBytes = hexToBytes(encodedMessage);

    let messageHash: Uint8Array;
    switch (this.signerSpec.hashFunction) {
      case AdamikHashFunction.SHA256:
        messageHash = hexToBytes(ethers.sha256(messageBytes).slice(2));
        break;
      case AdamikHashFunction.KECCAK256:
        messageHash = hexToBytes(ethers.keccak256(messageBytes).slice(2));
        break;
      case AdamikHashFunction.SHA512_256:
        throw new Error("SHA512_256 not implemented");
      case AdamikHashFunction.PEDERSEN: {
        const x = messageBytes;
        const y = new Uint8Array([0]);
        const pedersenHash = ec.starkCurve.pedersen(x, y);
        messageHash = hexToBytes(pedersenHash.slice(2));
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

        return extractSignature(
          this.signerSpec.signatureFormat as AdamikSignatureFormat,
          {
            r: sig.r.slice(2),
            s: sig.s.slice(2),
            v: sig.v.toString(16),
          }
        );
      }
      case AdamikCurve.ED25519: {
        const keyPair = await this.getEd25519KeyPair();
        const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);

        return extractSignature(
          this.signerSpec.signatureFormat as AdamikSignatureFormat,
          {
            r: bytesToHex(signature.slice(0, 32)),
            s: bytesToHex(signature.slice(32, 64)),
          }
        );
      }
      case AdamikCurve.STARK: {
        const privateKey = await this.getStarkPrivateKey();
        const signature = ec.starkCurve.sign(messageHash, privateKey);
        return extractSignature(
          this.signerSpec.signatureFormat as AdamikSignatureFormat,
          {
            r: signature.r.toString(16),
            s: signature.s.toString(16),
          }
        );
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
