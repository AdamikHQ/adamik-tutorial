import { adamikAPIKey, adamikURL } from "@/utils/utils";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import { apiLogsInstance } from "./apiLogsManager";
import { AdamikChain } from "./types";

export const adamikGetChains = async () => {
  try {
    const apiKey = adamikAPIKey();
    const apiBaseUrl = adamikURL();

    if (!apiKey || !apiBaseUrl) {
      throw new Error(
        "Missing API configuration. Please check your environment variables."
      );
    }

    // Log the API call
    const apiUrl = `${apiBaseUrl}/api/chains`;
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
      const errorMessage = `API request failed with status ${response.status}`;

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

    // Check if chains data exists
    if (!data.chains) {
      const errorMessage = "No chains data found in API response";

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

    const chains: Record<string, AdamikChain> = data.chains;

    // Log the successful response
    if (apiLogsInstance && logId !== -1) {
      logApiResponse(apiLogsInstance, logId, {
        status: response.status,
        data: { chainCount: Object.keys(chains).length },
      });
    }

    return { chains };
  } catch (error) {
    console.error("Error fetching chains:", error);
    throw error;
  }
};
