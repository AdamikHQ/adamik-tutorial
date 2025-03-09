import { AdamikBalance } from "./types";

export const getAccountState = async (chainId: string, accountId: string) => {
  const fetchBalance = await fetch(
    `${process.env.ADAMIK_API_BASE_URL}/api/${chainId}/account/${accountId}/state`,
    {
      method: "GET",
      headers: {
        Authorization: process.env.ADAMIK_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  const balance: AdamikBalance = await fetchBalance.json();

  return balance;
};
