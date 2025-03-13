// Simplified chain information for display purposes only
// Full chain details will be fetched from the API when needed
export const showroomChains: Record<
  string,
  {
    name: string;
    ticker: string;
    explorerUrl?: string;
    defaultRecipient?: string; // Default recipient address for transactions
    defaultAmount?: string; // Default amount to transfer
  }
> = {
  ethereum: {
    name: "Ethereum",
    ticker: "ETH",
    explorerUrl: "https://etherscan.io/tx/",
    // For Ethereum, we'll use self-send (null means use sender address)
    defaultAmount: "0.0001",
  },
  cosmoshub: {
    name: "CosmosHub",
    ticker: "ATOM",
    explorerUrl: "https://www.mintscan.io/cosmos/tx/",
    // defaultRecipient: "cosmos1yvuhqg73fdzxvam9sj7mazfa38gpn7ulsavh7s",
    defaultAmount: "0.01",
  },
  ton: {
    name: "TON",
    ticker: "TON",
    explorerUrl: "https://tonscan.org/tx/",
    defaultRecipient: "UQDbIvjHr-5d-FMS8xIqOIqS4zsY7EwRz6rKfhLhaPcGUaZs", // TON example address
    defaultAmount: "0.1",
  },
  tron: {
    name: "Tron",
    ticker: "TRX",
    explorerUrl: "https://tronscan.org/#/transaction/",
    defaultRecipient: "TVKG4gUar24bpAVrDv4GSzyDRtPkjPkogL", // Tron example address
    defaultAmount: "1",
  },
  optimism: {
    name: "Optimism",
    ticker: "OP",
    explorerUrl: "https://optimistic.etherscan.io/tx/",
    // For Optimism, we'll use self-send
    defaultAmount: "0.001",
  },
  arbitrum: {
    name: "Arbitrum",
    ticker: "ARB",
    explorerUrl: "https://arbiscan.io/tx/",
    // For Arbitrum, we'll use self-send
    defaultAmount: "0.001",
  },
  polygon: {
    name: "Polygon",
    ticker: "MATIC",
    explorerUrl: "https://polygonscan.com/tx/",
    // For Polygon, we'll use self-send
    defaultAmount: "0.1",
  },
  avalanche: {
    name: "Avalanche",
    ticker: "AVAX",
    explorerUrl: "https://snowtrace.io/tx/",
    // For Avalanche, we'll use self-send
    defaultAmount: "0.01",
  },
  bsc: {
    name: "BNB Chain",
    ticker: "BNB",
    explorerUrl: "https://bscscan.com/tx/",
    // For BNB Chain, we'll use self-send
    defaultAmount: "0.001",
  },
};
