import { AdamikChain } from "./types";

export const adamikGetChains = async () => {
  try {
    const apiKey = import.meta.env.VITE_ADAMIK_API_KEY;
    const apiBaseUrl = import.meta.env.VITE_ADAMIK_API_BASE_URL;

    if (!apiKey || !apiBaseUrl) {
      throw new Error(
        "Missing API configuration. Please check your environment variables."
      );
    }

    const response = await fetch(`${apiBaseUrl}/api/chains`, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if chains data exists
    if (!data.chains) {
      throw new Error("No chains data found in API response");
    }

    const chains: Record<string, AdamikChain> = data.chains;

    return { chains };
  } catch (error) {
    console.error("Error fetching chains:", error);
    throw error;
  }
};
