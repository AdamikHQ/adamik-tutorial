import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import {
  adamikAPIKey,
  adamikURL,
  errorTerminal,
  infoTerminal,
} from "../utils/utils";
import { apiLogsInstance } from "./apiLogsManager";
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
  infoTerminal("Broadcasting transaction...", "Adamik");

  // Prepare to broadcast the signed transaction
  const broadcastRequestBody = {
    transaction: {
      data: transactionEncodeResponse.transaction.data,
      encoded: transactionEncodeResponse.transaction.encoded,
      signature: signature,
    },
  };

  // Log API call
  let logId = 0;
  if (apiLogsInstance) {
    const apiUrl =
      import.meta.env.VITE_ADAMIK_API_BASE_URL ||
      "https://api-staging.adamik.io";
    const url = `${apiUrl}/api/${chainId}/transaction/broadcast`;

    logId = logApiCall(
      apiLogsInstance,
      "Adamik",
      url,
      "POST",
      JSON.stringify(broadcastRequestBody)
    );
  }

  try {
    const apiUrl = adamikURL();
    const apiKey = adamikAPIKey();

    // Broadcast the transaction using Adamik API
    const broadcastResponse = await fetch(
      `${apiUrl}/api/${chainId}/transaction/broadcast`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(broadcastRequestBody),
      }
    );

    const result =
      (await broadcastResponse.json()) as AdamikAPIError<AdamikBroadcastResponse>;

    // Log API response
    if (apiLogsInstance) {
      logApiResponse(
        apiLogsInstance,
        logId,
        JSON.stringify(result),
        result.status?.errors?.length > 0
      );
    }

    if (result.status?.errors?.length > 0) {
      errorTerminal("Transaction broadcast failed:", "Adamik");
      infoTerminal(JSON.stringify(result, null, 2), "Adamik");
      throw new Error(
        result.status.errors[0].message || "Transaction broadcast failed"
      );
    }

    return result;
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
