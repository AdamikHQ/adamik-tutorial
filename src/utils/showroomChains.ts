// Simplified chain information for display purposes only
// Full chain details will be fetched from the API when needed
export const showroomChains: Record<string, { name: string; ticker: string }> =
  {
    bitcoin: {
      name: "Bitcoin",
      ticker: "BTC",
    },
    ethereum: {
      name: "Ethereum",
      ticker: "ETH",
    },
    cosmoshub: {
      name: "CosmosHub",
      ticker: "ATOM",
    },
    ton: {
      name: "TON",
      ticker: "TON",
    },
    tron: {
      name: "Tron",
      ticker: "TRX",
    },
    optimism: {
      name: "Optimism",
      ticker: "OP",
    },
  };
