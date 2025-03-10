import { AdamikBalance } from "./types";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import { apiLogsInstance } from "./apiLogsManager";

export const getAccountState = async (chainId: string, accountId: string) => {
  try {
    // Log the API call
    const apiUrl = `${
      import.meta.env.VITE_ADAMIK_API_BASE_URL
    }/api/${chainId}/account/${accountId}/state`;
    let logId = -1;

    if (apiLogsInstance) {
      logId = logApiCall(apiLogsInstance, "Adamik", apiUrl, "GET", {
        chainId,
        accountId,
      });
    }

    console.log(`Fetching account state for ${chainId}:${accountId}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: import.meta.env.VITE_ADAMIK_API_KEY!,
        "Content-Type": "application/json",
      },
    });

    // Log the response status
    console.log(`Account state response status: ${response.status}`);

    if (!response.ok) {
      // For Bitcoin and some other chains, the API might return 404
      // We'll create a default balance structure
      if (chainId === "bitcoin" || response.status === 404) {
        console.log(`Creating default balance for ${chainId}`);
        const defaultBalance = {
          balances: {
            native: {
              available: "0",
              total: "0",
              unconfirmed: "0",
            },
            tokens: [],
            staking: null,
          },
        };

        // Log the response
        if (apiLogsInstance && logId !== -1) {
          logApiResponse(
            apiLogsInstance,
            logId,
            { status: response.status, data: defaultBalance },
            true
          );
        }

        return defaultBalance;
      }

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

    const balance = await response.json();

    // Log the response structure
    console.log(
      `Account state response structure:`,
      Object.keys(balance).length > 0 ? Object.keys(balance) : "Empty response"
    );

    // Log the successful response
    if (apiLogsInstance && logId !== -1) {
      logApiResponse(apiLogsInstance, logId, {
        status: response.status,
        data: balance,
      });
    }

    // Ensure the response has the expected structure
    if (!balance.balances) {
      console.warn(
        `Response missing balances property for ${chainId}:${accountId}`
      );
      const defaultBalance = {
        balances: {
          native: {
            available: "0",
            total: "0",
            unconfirmed: "0",
          },
          tokens: [],
          staking: null,
        },
      };

      // Log the response with warning
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(apiLogsInstance, logId, {
          status: response.status,
          data: defaultBalance,
          warning: "Response missing balances property",
        });
      }

      return defaultBalance;
    }

    return balance;
  } catch (error) {
    console.error("Error fetching account state:", error);

    // Return a default balance structure instead of throwing
    const defaultBalance = {
      balances: {
        native: {
          available: "0",
          total: "0",
          unconfirmed: "0",
        },
        tokens: [],
        staking: null,
      },
    };

    return defaultBalance;
  }
};
