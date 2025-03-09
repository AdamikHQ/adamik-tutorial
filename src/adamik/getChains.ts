import prompts from "prompts";
import { AdamikChain } from "./types";

export const adamikGetChains = async () => {
  const fetchAllChains = await fetch(
    `${process.env.ADAMIK_API_BASE_URL}/api/chains`,
    {
      headers: {
        Authorization: process.env.ADAMIK_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );
  const chains: Record<string, AdamikChain> = (
    (await fetchAllChains.json()) as { chains: Record<string, AdamikChain> }
  ).chains;

  const { chainId } = await prompts({
    type: "autocomplete",
    name: "chainId",
    message: "Select a chain",
    choices: Object.keys(chains).map((chain) => ({
      title: `${chains[chain].name} (${chains[chain].ticker}) - ${chains[chain].signerSpec.curve} | ${chains[chain].signerSpec.hashFunction} | CoinType: ${chains[chain].signerSpec.coinType}`,
      value: chain,
    })),
  });

  if (!chainId) {
    throw new Error("No chain selected");
  }

  const signerSpec = chains[chainId].signerSpec;

  return { chains, chainId, signerSpec };
};
