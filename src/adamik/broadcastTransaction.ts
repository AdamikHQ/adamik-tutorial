import prompts from "prompts";
import { errorTerminal, infoTerminal } from "../utils";
import {
  AdamikAPIError,
  AdamikBroadcastResponse,
  AdamikTransactionEncodeResponse,
} from "./types";

export const broadcastTransaction = async (
  chainId: string,
  transactionEncodeResponse: AdamikTransactionEncodeResponse,
  signature: string
) => {
  const { acceptBroadcast } = await prompts({
    type: "confirm",
    name: "acceptBroadcast",
    message: "Do you wish to broadcast the transaction ?",
    initial: true,
  });

  if (!acceptBroadcast) {
    infoTerminal("Transaction not broadcasted.");
    return;
  }

  // Prepare to broadcast the signed transaction
  const broadcastRequestBody = {
    transaction: {
      data: transactionEncodeResponse.transaction.data,
      encoded: transactionEncodeResponse.transaction.encoded,
      signature: signature,
    },
  };

  // Broadcast the transaction using Adamik API
  const broadcastResponse = await fetch(
    `${process.env.ADAMIK_API_BASE_URL}/api/${chainId}/transaction/broadcast`,
    {
      method: "POST",
      headers: {
        Authorization: process.env.ADAMIK_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(broadcastRequestBody),
    }
  );

  try {
    const result =
      (await broadcastResponse.json()) as AdamikAPIError<AdamikBroadcastResponse>;

    return result;
  } catch (e: any) {
    errorTerminal(e.message, "Adamik");
  }
};
