import { adamikAPIKey, adamikURL } from "@/utils/utils";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import { apiLogsInstance } from "./apiLogsManager";
import { AdamikAPIError, AdamikEncodePubkeyToAddressResponse } from "./types";

export const encodePubKeyToAddress = async (
  pubKey: string,
  chainId: string
) => {
  try {
    const apiBaseUrl = adamikURL();
    const apiKey = adamikAPIKey();

    // Log the API call
    const apiUrl = `${apiBaseUrl}/api/${chainId}/address/encode`;
    let logId = -1;

    if (apiLogsInstance) {
      logId = logApiCall(apiLogsInstance, "Adamik", apiUrl, "POST", {
        pubkey: pubKey,
      });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pubkey: pubKey,
      }),
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

    const pubkeyToAddresses: AdamikAPIError<AdamikEncodePubkeyToAddressResponse> =
      await response.json();

    if (
      pubkeyToAddresses.status &&
      pubkeyToAddresses.status.errors.length > 0
    ) {
      const errorMessage = pubkeyToAddresses.status.errors[0].message;

      // Log the error response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: response.status,
            error: errorMessage,
            data: pubkeyToAddresses,
          },
          true
        );
      }

      throw new Error(errorMessage);
    }

    const addresses = pubkeyToAddresses.addresses;

    if (addresses.length === 0) {
      const errorMessage = "No addresses found for the given public key";

      // Log the error response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: response.status,
            error: errorMessage,
            data: pubkeyToAddresses,
          },
          true
        );
      }

      throw new Error(errorMessage);
    }

    // Log the successful response
    if (apiLogsInstance && logId !== -1) {
      logApiResponse(apiLogsInstance, logId, {
        status: response.status,
        data: pubkeyToAddresses,
      });
    }

    // In browser context, we'll always use the first address
    // This is typically the most common/default address format for the chain
    return {
      address: addresses[0].address,
      type: addresses[0].type,
      allAddresses: addresses,
    };
  } catch (error) {
    console.error(`Error encoding pubkey to address:`, error);
    throw error;
  }
};
