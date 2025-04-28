import { adamikAPIKey, adamikURL } from "@/utils/utils";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import { apiLogsInstance } from "./apiLogsManager";
import { AdamikChain } from "./types";

/**
 * Fetches information for a specific blockchain by its chainId
 * @param chainId - The ID of the chain to retrieve (e.g., "bitcoin", "ethereum")
 * @returns The chain information
 */
export const adamikGetChain = async (chainId: string): Promise<AdamikChain> => {
  try {
    const apiKey = adamikAPIKey();
    const apiBaseUrl = adamikURL();

    if (!apiBaseUrl) {
      throw new Error(
        "Missing API configuration. Please check your environment variables."
      );
    }

    if (!chainId) {
      throw new Error("Chain ID is required");
    }

    // Log the API call
    const apiUrl = `${apiBaseUrl}/api/chains/${chainId}`;
    let logId = -1;

    if (apiLogsInstance) {
      logId = logApiCall(apiLogsInstance, "Adamik", apiUrl, "GET");
    }

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage =
        response.status === 404
          ? `Chain not found: ${chainId}`
          : `API request failed with status ${response.status}`;

      // Log the error response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          { status: response.status, error: errorMessage },
          true
        );
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Check if chain data exists
    if (!data.chain) {
      const errorMessage = `No chain data found for ${chainId}`;

      // Log the error response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          { status: response.status, error: errorMessage },
          true
        );
      }

      throw new Error(errorMessage);
    }

    // Log the successful response
    if (apiLogsInstance && logId !== -1) {
      logApiResponse(apiLogsInstance, logId, {
        status: response.status,
        data: data.chain,
      });
    }

    return data.chain as AdamikChain;
  } catch (error) {
    console.error(`Error fetching chain ${chainId}:`, error);
    throw error;
  }
};
