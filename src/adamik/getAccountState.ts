import { AdamikBalance } from "./types";

export const getAccountState = async (chainId: string, accountId: string) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_ADAMIK_API_BASE_URL
      }/api/${chainId}/account/${accountId}/state`,
      {
        method: "GET",
        headers: {
          Authorization: import.meta.env.VITE_ADAMIK_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const balance: AdamikBalance = await response.json();
    return balance;
  } catch (error) {
    console.error("Error fetching account state:", error);
    throw error;
  }
};
