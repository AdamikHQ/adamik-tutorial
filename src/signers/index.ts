import { AdamikSignerSpec } from "../adamik/types";
import { LocalSigner } from "./LocalSigner";
import { SodotSigner } from "./Sodot";
import { TurnkeySigner } from "./Turnkey";
import { BaseSigner } from "./types";

export enum Signer {
  LOCAL = "LOCAL MNEMONIC (UNSECURE)",
  SODOT = "Secure Signer (Sodot)",
  TURNKEY = "TURNKEY",
}

export const signerSelector = async (
  chainId: string,
  signerSpec: AdamikSignerSpec,
  signerName: Signer
): Promise<BaseSigner> => {
  switch (signerName) {
    case Signer.LOCAL:
      LocalSigner.isConfigValid();
      return new LocalSigner(chainId, signerSpec);
    case Signer.SODOT:
      // Should throw an error if the config is not valid.
      SodotSigner.isConfigValid();
      return new SodotSigner(chainId, signerSpec);
    case Signer.TURNKEY:
      // Should throw an error if the config is not valid.
      TurnkeySigner.isConfigValid();
      return new TurnkeySigner(chainId, signerSpec);
    default:
      throw new Error(`Unsupported signer: ${signerName}`);
  }
};

// Helper function to check if a signer is available
export const isSignerAvailable = (signer: Signer): boolean => {
  switch (signer) {
    case Signer.LOCAL:
      return !!process.env.UNSECURE_LOCAL_SEED;
    case Signer.SODOT:
      try {
        return SodotSigner.isConfigValid();
      } catch (e) {
        return false;
      }
    case Signer.TURNKEY:
      try {
        return TurnkeySigner.isConfigValid();
      } catch (e) {
        return false;
      }
    default:
      return false;
  }
};
