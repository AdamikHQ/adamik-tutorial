import {
  AdamikChain,
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignatureFormat,
} from "../adamik/types";

// Hardcoded chains for the simplified flow
export const hardcodedChains: Record<string, AdamikChain> = {
  bitcoin: {
    name: "Bitcoin",
    ticker: "BTC",
    decimals: 8,
    family: "bitcoin",
    signerSpec: {
      curve: AdamikCurve.SECP256K1,
      hashFunction: AdamikHashFunction.SHA256,
      signatureFormat: AdamikSignatureFormat.RS,
      coinType: "0",
    },
    supportedFeatures: {
      read: { token: true, validators: true, transaction: true, account: true },
      write: { transaction: true },
      utils: { addresses: true },
    },
  },
  ethereum: {
    name: "Ethereum",
    ticker: "ETH",
    decimals: 18,
    family: "evm",
    signerSpec: {
      curve: AdamikCurve.SECP256K1,
      hashFunction: AdamikHashFunction.KECCAK256,
      signatureFormat: AdamikSignatureFormat.RSV,
      coinType: "60",
    },
    supportedFeatures: {
      read: { token: true, validators: true, transaction: true, account: true },
      write: { transaction: true },
      utils: { addresses: true },
    },
  },
  cosmoshub: {
    name: "CosmosHub",
    ticker: "ATOM",
    decimals: 6,
    family: "cosmos",
    signerSpec: {
      curve: AdamikCurve.SECP256K1,
      hashFunction: AdamikHashFunction.SHA256,
      signatureFormat: AdamikSignatureFormat.RS,
      coinType: "118",
    },
    supportedFeatures: {
      read: { token: true, validators: true, transaction: true, account: true },
      write: { transaction: true },
      utils: { addresses: true },
    },
  },
  ton: {
    name: "TON",
    ticker: "TON",
    decimals: 9,
    family: "ton",
    signerSpec: {
      curve: AdamikCurve.ED25519,
      hashFunction: AdamikHashFunction.SHA256,
      signatureFormat: AdamikSignatureFormat.RS,
      coinType: "607",
    },
    supportedFeatures: {
      read: { token: true, validators: true, transaction: true, account: true },
      write: { transaction: true },
      utils: { addresses: true },
    },
  },
  tron: {
    name: "Tron",
    ticker: "TRX",
    decimals: 6,
    family: "tron",
    signerSpec: {
      curve: AdamikCurve.SECP256K1,
      hashFunction: AdamikHashFunction.SHA256,
      signatureFormat: AdamikSignatureFormat.RS,
      coinType: "195",
    },
    supportedFeatures: {
      read: { token: true, validators: true, transaction: true, account: true },
      write: { transaction: true },
      utils: { addresses: true },
    },
  },
  starknet: {
    name: "Starknet",
    ticker: "STRK",
    decimals: 18,
    family: "starknet",
    signerSpec: {
      curve: AdamikCurve.STARK,
      hashFunction: AdamikHashFunction.PEDERSEN,
      signatureFormat: AdamikSignatureFormat.RS,
      coinType: "9004",
    },
    supportedFeatures: {
      read: { token: true, validators: true, transaction: true, account: true },
      write: { transaction: true },
      utils: { addresses: true },
    },
  },
};
