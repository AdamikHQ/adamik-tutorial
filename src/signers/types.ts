import { AdamikSignerSpec } from "../adamik/types";

export interface BaseSigner {
  signerSpec: AdamikSignerSpec;
  signerName: string;
  chainId: string;

  getPubkey(): Promise<string>;
  signTransaction(encodedMessage: string): Promise<string>;
  signHash(hash: string): Promise<string>;
}
