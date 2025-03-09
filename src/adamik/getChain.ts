import { AdamikChain } from "./types";

/**
 * Fetches information for a specific blockchain by its chainId
 * @param chainId - The ID of the chain to retrieve (e.g., "bitcoin", "ethereum")
 * @returns The chain information
 */
export const adamikGetChain = async (chainId: string): Promise<AdamikChain> => {
  try {
    const apiKey = import.meta.env.VITE_ADAMIK_API_KEY;
    const apiBaseUrl = import.meta.env.VITE_ADAMIK_API_BASE_URL;

    if (!apiKey || !apiBaseUrl) {
      throw new Error(
        "Missing API configuration. Please check your environment variables."
      );
    }

    if (!chainId) {
      throw new Error("Chain ID is required");
    }

    const response = await fetch(`${apiBaseUrl}/api/chains/${chainId}`, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Chain not found: ${chainId}`);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if chain data exists
    if (!data.chain) {
      throw new Error(`No chain data found for ${chainId}`);
    }

    return data.chain as AdamikChain;
  } catch (error) {
    console.error(`Error fetching chain ${chainId}:`, error);
    throw error;
  }
};
