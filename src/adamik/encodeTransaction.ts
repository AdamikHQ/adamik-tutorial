import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import {
  adamikAPIKey,
  adamikURL,
  errorTerminal,
  infoTerminal,
} from "../utils/utils";
import { apiLogsInstance } from "./apiLogsManager";
import { AdamikAPIError, AdamikTransactionEncodeResponse } from "./types";

export const encodeTransaction = async ({
  chainId,
  senderAddress,
  recipientAddress,
  amount,
  mode = "transfer",
  pubkey,
  targetValidatorAddress = "",
}: {
  chainId: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  mode?: "transfer" | "stake";
  pubkey?: string;
  targetValidatorAddress?: string;
}): Promise<AdamikTransactionEncodeResponse | undefined> => {
  infoTerminal(`Encoding ${mode} transaction...`, "Adamik");

  const requestBody: any = {
    transaction: {
      data: {
        chainId: chainId,
        mode: mode,
        senderAddress: senderAddress,
        recipientAddress: recipientAddress,
        amount: amount,
        useMaxAmount: false,
      },
    },
  };

  if (mode === "stake" && targetValidatorAddress) {
    requestBody.transaction.data.targetValidatorAddress =
      targetValidatorAddress;
  }

  if (pubkey) {
    requestBody.transaction.data.senderPubKey = pubkey;
  }

  // Log API call
  let logId = 0;
  if (apiLogsInstance) {
    const apiUrl = adamikURL();
    const url = `${apiUrl}/api/${chainId}/transaction/encode`;

    logId = logApiCall(
      apiLogsInstance,
      "Adamik",
      url,
      "POST",
      JSON.stringify(requestBody)
    );
  }

  try {
    const apiUrl = adamikURL();
    const apiKey = adamikAPIKey();

    const postTransactionEncode = await fetch(
      `${apiUrl}/api/${chainId}/transaction/encode`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const transactionEncodeResponse: AdamikAPIError<AdamikTransactionEncodeResponse> =
      (await postTransactionEncode.json()) as AdamikAPIError<AdamikTransactionEncodeResponse>;

    // Log API response
    if (apiLogsInstance) {
      logApiResponse(
        apiLogsInstance,
        logId,
        JSON.stringify(transactionEncodeResponse),
        transactionEncodeResponse.status?.errors?.length > 0
      );
    }

    if (transactionEncodeResponse.status?.errors?.length > 0) {
      errorTerminal("Transaction encoding failed, check payload:", "Adamik");
      infoTerminal(JSON.stringify(requestBody, null, 2), "Adamik");

      infoTerminal("and response:", "Adamik");
      infoTerminal(
        JSON.stringify(transactionEncodeResponse, null, 2),
        "Adamik"
      );

      throw new Error(
        transactionEncodeResponse.status.errors[0].message ||
          "Transaction encoding failed"
      );
    }

    return transactionEncodeResponse;
  } catch (error) {
    // If the API call fails, log the error
    if (apiLogsInstance) {
      logApiResponse(
        apiLogsInstance,
        logId,
        JSON.stringify({ error: (error as Error).message }),
        true
      );
    }
    throw error;
  }
};
