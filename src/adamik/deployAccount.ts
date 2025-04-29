import { adamikAPIKey, adamikURL } from "@/utils/utils";
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
    `${adamikURL()}/api/${chainId}/transaction/encode`,
    {
      method: "POST",
      headers: {
        Authorization: adamikAPIKey(),
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
