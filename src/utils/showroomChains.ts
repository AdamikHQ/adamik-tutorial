// Simplified chain information for display purposes only
// Full chain details will be fetched from the API when needed
export const showroomChains: Record<
  string,
  { name: string; ticker: string; explorerUrl?: string }
> = {
  bitcoin: {
    name: "Bitcoin",
    ticker: "BTC",
    explorerUrl: "https://mempool.space/tx/",
  },
  ethereum: {
    name: "Ethereum",
    ticker: "ETH",
    explorerUrl: "https://etherscan.io/tx/",
  },
  cosmoshub: {
    name: "CosmosHub",
    ticker: "ATOM",
    explorerUrl: "https://www.mintscan.io/cosmos/tx/",
  },
  ton: {
    name: "TON",
    ticker: "TON",
    explorerUrl: "https://tonscan.org/tx/",
  },
  tron: {
    name: "Tron",
    ticker: "TRX",
    explorerUrl: "https://tronscan.org/#/transaction/",
  },
  optimism: {
    name: "Optimism",
    ticker: "OP",
    explorerUrl: "https://optimistic.etherscan.io/tx/",
  },
  arbitrum: {
    name: "Arbitrum",
    ticker: "ARB",
    explorerUrl: "https://arbiscan.io/tx/",
  },
  polygon: {
    name: "Polygon",
    ticker: "MATIC",
    explorerUrl: "https://polygonscan.com/tx/",
  },
  avalanche: {
    name: "Avalanche",
    ticker: "AVAX",
    explorerUrl: "https://snowtrace.io/tx/",
  },
  bsc: {
    name: "BNB Chain",
    ticker: "BNB",
    explorerUrl: "https://bscscan.com/tx/",
  },
};
