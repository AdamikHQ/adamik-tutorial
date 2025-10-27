export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Import Turnkey SDK dynamically to ensure it runs on server side
  const { Turnkey } = await import("@turnkey/sdk-server");

  const turnkeyClient = new Turnkey({
    apiBaseUrl: process.env.VITE_TURNKEY_BASE_URL || process.env.TURNKEY_BASE_URL || "https://api.turnkey.com",
    apiPublicKey: process.env.VITE_TURNKEY_API_PUBLIC_KEY || process.env.TURNKEY_API_PUBLIC_KEY,
    apiPrivateKey: process.env.VITE_TURNKEY_API_PRIVATE_KEY || process.env.TURNKEY_API_PRIVATE_KEY,
    defaultOrganizationId: process.env.VITE_TURNKEY_ORGANIZATION_ID || process.env.TURNKEY_ORGANIZATION_ID,
  });

  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join("/") : path;

  try {
    let result;

    // Handle different Turnkey API endpoints
    switch (endpoint) {
      case "get-wallet-accounts":
        result = await turnkeyClient.apiClient().getWalletAccounts({
          walletId: req.body.walletId || process.env.VITE_TURNKEY_WALLET_ID || process.env.TURNKEY_WALLET_ID,
          paginationOptions: req.body.paginationOptions || { limit: "100" }
        });
        break;

      case "get-wallet-account":
        result = await turnkeyClient.apiClient().getWalletAccount({
          walletId: req.body.walletId,
          accountId: req.body.accountId
        });
        break;

      case "sign-raw-payload":
        result = await turnkeyClient.apiClient().signRawPayload({
          walletId: req.body.walletId || process.env.VITE_TURNKEY_WALLET_ID || process.env.TURNKEY_WALLET_ID,
          signWith: req.body.signWith,
          payload: req.body.payload,
          hashFunction: req.body.hashFunction || "HASH_FUNCTION_NOT_APPLICABLE",
          encoding: req.body.encoding || "ENCODING_HEX"
        });
        break;

      default:
        res.status(404).json({ error: `Unknown endpoint: ${endpoint}` });
        return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Turnkey API error:", error);
    res.status(500).json({
      error: error.message || "Turnkey API request failed",
      details: error.response?.data || error
    });
  }
}