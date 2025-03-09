import { AdamikAPIError, AdamikEncodePubkeyToAddressResponse } from "./types";

export const encodePubKeyToAddress = async (
  pubKey: string,
  chainId: string
) => {
  const fetchPubkeyToAddresses = await fetch(
    `${import.meta.env.VITE_ADAMIK_API_BASE_URL}/api/${chainId}/address/encode`,
    {
      method: "POST",
      headers: {
        Authorization: import.meta.env.VITE_ADAMIK_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pubkey: pubKey,
      }),
    }
  );

  const pubkeyToAddresses: AdamikAPIError<AdamikEncodePubkeyToAddressResponse> =
    await fetchPubkeyToAddresses.json();

  if (pubkeyToAddresses.status && pubkeyToAddresses.status.errors.length > 0) {
    throw new Error(pubkeyToAddresses.status.errors[0].message);
  }

  const addresses = pubkeyToAddresses.addresses;

  if (addresses.length === 0) {
    throw new Error("No addresses found for the given public key");
  }

  // In browser context, we'll always use the first address
  // This is typically the most common/default address format for the chain
  return {
    address: addresses[0].address,
    type: addresses[0].type,
    allAddresses: addresses,
  };
};
