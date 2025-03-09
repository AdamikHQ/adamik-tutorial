import picocolors from "picocolors";
import { AdamikSignatureFormat } from "../adamik/types";
import { Signer } from "../signers";

/**
 * Converts an amount from the main unit to the smallest unit
 * @param amount - The amount in the main unit
 * @param decimals - The number of decimals in the smallest unit
 * @returns The amount in the smallest unit or null if invalid amount
 * Example: 1 -> 1000000000000000000
 */
export const amountToSmallestUnit = (
  amount: string,
  decimals: number
): string => {
  const computedAmount = Number(amount) * Math.pow(10, decimals);
  return Math.trunc(computedAmount).toString();
};

/**
 * Converts an amount from the smallest unit to the main unit
 * @param amount - The amount in the smallest unit
 * @param decimals - The number of decimals in the smallest unit
 * @returns The amount in the main unit or null if invalid amount
 * Example: 1000000000000000000 -> 1
 */
export const amountToMainUnit = (
  amount: string,
  decimals: number
): string | null => {
  const parsedAmount = amount === "0" ? 0 : Number(amount);
  return Number.isNaN(parsedAmount)
    ? null
    : (parsedAmount / Math.pow(10, decimals)).toString();
};

/**
 * Checks if a string is a valid BIP44 derivation path
 * @param path - The string to check
 * @returns boolean indicating if the string is a valid derivation path
 * Example: "m/44'/60'/0'/0/0" -> true
 */
export const isDerivationPath = (path: string): boolean => {
  // Check if path starts with 'm/'
  if (!path.startsWith("m/")) {
    return false;
  }

  // Split the path and remove the 'm' element
  const segments = path.split("/").slice(1);

  // Check if we have at least 2 segments after 'm'
  if (segments.length < 2) {
    return false;
  }

  // Check if each segment is valid
  return segments.every((segment) => {
    // Remove hardened indicator
    const cleanSegment = segment.replace("'", "");
    // Check if it's a valid non-negative number
    const num = parseInt(cleanSegment);
    return !isNaN(num) && num >= 0;
  });
};

/**
 * Extracts the coinType from a BIP44 derivation path
 * @param derivationPath - The derivation path (e.g. "m/44'/60'/0'/0/0")
 * @returns The coinType number or null if invalid path
 * Example: "m/44'/60'/0'/0/0" -> 60
 */
export const getCoinTypeFromDerivationPath = (
  derivationPath: string
): number | null => {
  if (!isDerivationPath(derivationPath)) {
    return null;
  }

  const segments = derivationPath.split("/");
  const coinTypeSegment = segments[2];
  const coinType = parseInt(coinTypeSegment.replace("'", ""));
  return coinType;
};

// Define console sources explicitly
const CONSOLE_SOURCE = ["Adamik", "LOCAL MNEMONIC (UNSECURE)", "SODOT"];

export const infoTerminal = (message: string, source?: string) => {
  if (source === "Adamik") {
    console.log(
      `${picocolors.bold(`[ADAMIK]`)} ${picocolors.blue(`${message}`)}`
    );
  } else if (source && CONSOLE_SOURCE.includes(source)) {
    console.log(
      `${picocolors.bold(`[${source.toUpperCase()}]`)} ${picocolors.green(
        `${message}`
      )}`
    );
  } else {
    console.log(`${picocolors.bold(`${message}`)}`);
  }
};

export const errorTerminal = (message: string, source?: string) => {
  console.log(
    `${picocolors.bold(`[${source?.toUpperCase()}]`)} ${picocolors.bgRed(
      `${message}`
    )}`
  );
};

export const successTerminal = (message: string, source?: string) => {
  console.log(picocolors.bgGreen(`[${source?.toUpperCase()}] ${message}`));
};

export const italicInfoTerminal = async (message: string, delayMs = 60) => {
  // Split the stringified JSON by newlines
  const lines = message.split("\n");

  // Display each line with a delay
  for (const line of lines) {
    console.log(picocolors.italic(line));
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};

const sanitizeSignature = (signature: { r: string; s: string; v?: string }) => {
  return {
    r: signature.r.replace("0x", ""),
    s: signature.s.replace("0x", ""),
    v: signature.v?.replace("0x", ""),
  };
};

export const extractSignature = (
  signatureFormat: AdamikSignatureFormat,
  signature: { r: string; s: string; v?: string }
) => {
  const sanitizedSignature = sanitizeSignature(signature);

  if (signatureFormat === AdamikSignatureFormat.RS) {
    return sanitizedSignature.r + sanitizedSignature.s;
  } else if (signatureFormat === AdamikSignatureFormat.RSV) {
    return sanitizedSignature.r + sanitizedSignature.s + sanitizedSignature.v;
  } else {
    throw new Error(`Unsupported signature format: ${signatureFormat}`);
  }
};
