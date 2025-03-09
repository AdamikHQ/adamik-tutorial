import { errorTerminal } from "../utils";
import { AdamikAPIError, AdamikTransactionEncodeResponse } from "./types";

export const deployAccount = async ({
  chainId,
  pubkey,
}: {
  chainId: string;
  pubkey?: string;
}) => {
  const requestBody: any = {
    transaction: {
      data: {
        mode: "deployAccount",
        type: "argentx",
        senderPubKey: pubkey,
      },
    },
  };

  const deployTransactionEncode = await fetch(
    `${process.env.ADAMIK_API_BASE_URL}/api/${chainId}/transaction/encode`,
    {
      method: "POST",
      headers: {
        Authorization: process.env.ADAMIK_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  const deployTransactionEncodeResponse =
    (await deployTransactionEncode.json()) as AdamikAPIError<AdamikTransactionEncodeResponse>;

  deployTransactionEncodeResponse.status.errors.forEach((error: any) => {
    errorTerminal(error.message, "Adamik");
    throw new Error(error.message);
  });

  return deployTransactionEncodeResponse;
};
