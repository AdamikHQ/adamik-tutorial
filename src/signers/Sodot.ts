import { apiLogsInstance } from "../adamik/apiLogsManager";
import {
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignerSpec,
} from "../adamik/types";
import { logApiCall, logApiResponse } from "../contexts/ApiLogsContext";
import {
  errorTerminal,
  extractSignature,
  infoTerminal,
  italicInfoTerminal,
} from "../utils/utils";
import { Signer } from "./index";
import { BaseSigner } from "./types";

type SodotSignatureResponse =
  | {
      r: string;
      s: string;
      v: number;
      der: string;
    }
  | { signature: string };

// Helper function to determine if we're running in a production environment (Vercel)
const isProduction = (): boolean => {
  // Check if we're in a production environment
  // This could be NODE_ENV === 'production' or a custom environment variable
  return (
    import.meta.env.PROD === true || window.location.hostname !== "localhost"
  );
};

// Helper function to ensure URLs have proper format (with https:// prefix)
const ensureUrlFormat = (url: string): string => {
  if (!url) return url;
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export class SodotSigner implements BaseSigner {
  public chainId: string;
  public signerSpec: AdamikSignerSpec;
  public signerName = Signer.SODOT;

  // TODO: Make this configurable and extendable
  private SODOT_VERTICES = isProduction()
    ? [
        // Production URLs (Vercel proxy)
        {
          url: "/api/sodot-proxy",
          apiKey: import.meta.env.SODOT_VERTEX_API_KEY_0!,
          vertexParam: "0",
        },
        {
          url: "/api/sodot-proxy",
          apiKey: import.meta.env.SODOT_VERTEX_API_KEY_1!,
          vertexParam: "1",
        },
        {
          url: "/api/sodot-proxy",
          apiKey: import.meta.env.SODOT_VERTEX_API_KEY_2!,
          vertexParam: "2",
        },
      ]
    : [
        // Development URLs (using local proxy to avoid CORS)
        {
          url: "/sodot-vertex-0",
          apiKey: import.meta.env.VITE_SODOT_VERTEX_API_KEY_0!,
        },
        {
          url: "/sodot-vertex-1",
          apiKey: import.meta.env.VITE_SODOT_VERTEX_API_KEY_1!,
        },
        {
          url: "/sodot-vertex-2",
          apiKey: import.meta.env.VITE_SODOT_VERTEX_API_KEY_2!,
        },
      ];
  private n = 3;
  private t = 2;

  private keyIds: string[] = [];

  constructor(chainId: string, signerSpec: AdamikSignerSpec) {
    this.chainId = chainId;
    this.signerSpec = signerSpec;

    switch (signerSpec.curve) {
      case AdamikCurve.SECP256K1:
        this.keyIds = isProduction()
          ? ["dummy", "dummy1", "dummy2"] // Note: we need to tricks production because it will be hanlde by proxy
          : import.meta.env.VITE_SODOT_EXISTING_ECDSA_KEY_IDS?.split(",") || [];
        break;
      case AdamikCurve.ED25519:
        this.keyIds = isProduction()
          ? ["dummy", "dummy1", "dummy2"] // Note: we need to tricks production because it will be hanlde by proxy
          : import.meta.env.VITE_SODOT_EXISTING_ED25519_KEY_IDS?.split(",") ||
            [];
        break;
      default:
        throw new Error(`Unsupported curve: ${signerSpec.curve}`);
    }
  }

  static isConfigValid(): boolean {
    // Check for API keys which are still required
    if (!import.meta.env.VITE_SODOT_VERTEX_API_KEY_0) {
      console.warn(
        "VITE_SODOT_VERTEX_API_KEY_0 is not set in your environment"
      );
    }
    if (!import.meta.env.VITE_SODOT_VERTEX_API_KEY_1) {
      console.warn(
        "VITE_SODOT_VERTEX_API_KEY_1 is not set in your environment"
      );
    }
    if (!import.meta.env.VITE_SODOT_VERTEX_API_KEY_2) {
      console.warn(
        "VITE_SODOT_VERTEX_API_KEY_2 is not set in your environment"
      );
    }

    // URLs are now handled by the proxy, so we don't need to check them here
    // But we'll still check if they're set for local development
    if (!import.meta.env.VITE_SODOT_VERTEX_URL_0) {
      console.warn(
        "VITE_SODOT_VERTEX_URL_0 is not set in your environment - this is required for the proxy to work"
      );
    }
    if (!import.meta.env.VITE_SODOT_VERTEX_URL_1) {
      console.warn(
        "VITE_SODOT_VERTEX_URL_1 is not set in your environment - this is required for the proxy to work"
      );
    }
    if (!import.meta.env.VITE_SODOT_VERTEX_URL_2) {
      console.warn(
        "VITE_SODOT_VERTEX_URL_2 is not set in your environment - this is required for the proxy to work"
      );
    }

    return true;
  }

  public async getPubkey(): Promise<string> {
    if (this.keyIds.length === 0) {
      infoTerminal("Generating new keypair...", this.signerName);
      this.keyIds = await this.keygenVertex(
        this.adamikCurveToSodotCurve(this.signerSpec.curve)
      );
      infoTerminal("Key generation completed.", this.signerName);

      if (this.signerSpec.curve === AdamikCurve.SECP256K1) {
        infoTerminal(
          "please use VITE_SODOT_EXISTING_ECDSA_KEY_IDS to be able to reuse the same keys",
          this.signerName
        );
        await italicInfoTerminal(
          `export VITE_SODOT_EXISTING_ECDSA_KEY_IDS="${this.keyIds.join(",")}"`,
          1000
        );
        infoTerminal(`keyIds: ${this.keyIds}`, this.signerName);
      } else if (this.signerSpec.curve === AdamikCurve.ED25519) {
        infoTerminal(
          "please use VITE_SODOT_EXISTING_ED25519_KEY_IDS to be able to reuse the same keys",
          this.signerName
        );
        await italicInfoTerminal(
          `export VITE_SODOT_EXISTING_ED25519_KEY_IDS="${this.keyIds.join(
            ","
          )}"`,
          10000
        );
      }
      infoTerminal("Done creating new keypair.", this.signerName);
    } else {
      infoTerminal("Using existing keypair from env.", this.signerName);
    }

    const pubkey = await this.derivePubkeyWithVertex(
      0,
      this.keyIds[0],
      [44, Number(this.signerSpec.coinType), 0, 0, 0],
      this.adamikCurveToSodotCurve(this.signerSpec.curve)
    );

    return pubkey;
  }

  public async signTransaction(encodedMessage: string): Promise<string> {
    const signature = await this.sign(
      encodedMessage,
      this.keyIds,
      [44, Number(this.signerSpec.coinType), 0, 0, 0],
      this.signerSpec.curve,
      this.adamikHashFunctionToSodotHashMethod(
        this.signerSpec.hashFunction,
        this.signerSpec.curve
      )
    );

    if (!signature) {
      errorTerminal("Failed to sign message with Sodot", this.signerName);
      throw new Error("Failed to sign message with Vertex");
    }

    infoTerminal("Signature from SODOT:", this.signerName);
    await italicInfoTerminal(JSON.stringify(signature, null, 2));

    if ("signature" in signature) {
      return signature.signature;
    }

    return extractSignature(this.signerSpec.signatureFormat, {
      ...signature,
      v: signature.v.toString(16),
    });
  }

  private adamikCurveToSodotCurve(
    adamikCurve: AdamikCurve
  ): "ecdsa" | "ed25519" {
    switch (adamikCurve) {
      case AdamikCurve.ED25519:
        return "ed25519";
      case AdamikCurve.SECP256K1:
        return "ecdsa";
      default:
        throw new Error(`Unsupported curve: ${adamikCurve}`);
    }
  }

  private async createRoomWithVertex(vertexId: number, roomSize: number) {
    // Determine the API URL based on the environment
    const apiUrl = isProduction()
      ? `${this.SODOT_VERTICES[vertexId].url}/create-room?vertex=${
          (this.SODOT_VERTICES[vertexId] as any).vertexParam
        }`
      : `${this.SODOT_VERTICES[vertexId].url}/create-room`;

    const requestBody = { room_size: roomSize };
    let logId = -1;

    // Log the API call
    if (apiLogsInstance) {
      logId = logApiCall(
        apiLogsInstance,
        "Sodot",
        apiUrl,
        "POST",
        requestBody,
        "Create Signing Room"
      );
    }

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
      };

      const response = await fetch(apiUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error creating room: ${errorText}`);
        console.error(`Status: ${response.status}`);

        // Log the error response with more details
        if (apiLogsInstance && logId !== -1) {
          logApiResponse(
            apiLogsInstance,
            logId,
            {
              status: response.status,
              error: errorText,
              details: {
                url: apiUrl,
                responseType: response.type,
                statusText: response.statusText,
              },
            },
            true
          );
        }

        throw new Error(`Failed to create room: ${errorText}`);
      }

      const roomUuid = (await response.json()) as { room_uuid: string };

      // Log the API response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(apiLogsInstance, logId, {
          status: response.status,
          data: roomUuid,
        });
      }

      return roomUuid.room_uuid;
    } catch (error) {
      console.error(`Error in createRoomWithVertex: ${error}`);

      // Log the error response with more details
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: 500,
            error: String(error),
            details: {
              url: apiUrl,
              vertexId,
              roomSize,
            },
          },
          true
        );
      }

      throw error;
    }
  }

  private async keygenInitWithVertex(
    vertexId: number,
    curve: "ecdsa" | "ed25519"
  ): Promise<{
    key_id: string;
    keygen_id: string;
  }> {
    // Determine the API URL based on the environment
    const apiUrl = isProduction()
      ? `${this.SODOT_VERTICES[vertexId].url}/${curve}/create?vertex=${
          (this.SODOT_VERTICES[vertexId] as any).vertexParam
        }`
      : `${this.SODOT_VERTICES[vertexId].url}/${curve}/create`;

    let logId = -1;

    // Log the API call
    if (apiLogsInstance) {
      logId = logApiCall(
        apiLogsInstance,
        "Sodot",
        apiUrl,
        "GET",
        undefined,
        "Initialize Key Generation"
      );
    }

    try {
      const fetchOptions: RequestInit = {
        method: "GET",
        headers: {
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
          "Content-Type": "application/json",
        },
        mode: "cors",
      };

      const response = await fetch(apiUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error initializing key generation: ${errorText}`);
        console.error(`Status: ${response.status}`);

        // Log the error response with more details
        if (apiLogsInstance && logId !== -1) {
          logApiResponse(
            apiLogsInstance,
            logId,
            {
              status: response.status,
              error: errorText,
              details: {
                url: apiUrl,
                responseType: response.type,
                statusText: response.statusText,
              },
            },
            true
          );
        }

        throw new Error(`Failed to initialize key generation: ${errorText}`);
      }

      const result = (await response.json()) as {
        key_id: string;
        keygen_id: string;
      };

      // Log the API response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(apiLogsInstance, logId, {
          status: 200,
          data: result,
        });
      }

      return result;
    } catch (error) {
      console.error(`Error in keygenInitWithVertex: ${error}`);

      // Log the error response with more details
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: 500,
            error: String(error),
            details: {
              url: apiUrl,
              vertexId,
              curve,
            },
          },
          true
        );
      }

      throw error;
    }
  }

  // We use /ecdsa/keygen to generate the key share for this Vertex.
  private async keygenWithVertex(
    vertexId: number,
    roomUuid: string,
    keyId: string,
    n: number,
    t: number,
    othersKeygenIds: string[],
    curve: "ecdsa" | "ed25519"
  ) {
    // Determine the API URL based on the environment
    const apiUrl = isProduction()
      ? `${this.SODOT_VERTICES[vertexId].url}/${curve}/keygen?vertex=${
          (this.SODOT_VERTICES[vertexId] as any).vertexParam
        }`
      : `${this.SODOT_VERTICES[vertexId].url}/${curve}/keygen`;

    let logId = -1;

    const requestBody = {
      room_uuid: roomUuid,
      key_id: keyId,
      num_parties: n,
      threshold: t,
      others_keygen_ids: othersKeygenIds,
    };

    // Log the API call
    if (apiLogsInstance) {
      logId = logApiCall(
        apiLogsInstance,
        "Sodot",
        apiUrl,
        "POST",
        requestBody,
        "Generate Key"
      );
    }

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
      };

      const response = await fetch(apiUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error generating key: ${errorText}`);
        console.error(`Status: ${response.status}`);

        // Log the error response with more details
        if (apiLogsInstance && logId !== -1) {
          logApiResponse(
            apiLogsInstance,
            logId,
            {
              status: response.status,
              error: errorText,
              details: {
                url: apiUrl,
                responseType: response.type,
                statusText: response.statusText,
                vertexId,
                curve,
                roomUuid,
                keyId,
              },
            },
            true
          );
        }

        throw new Error(
          `Failed to generate key for Vertex ${vertexId}: ${errorText}`
        );
      }

      // Log the successful response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(apiLogsInstance, logId, {
          status: response.status,
          data: { success: true },
        });
      }
    } catch (error) {
      console.error(`Error in keygenWithVertex: ${error}`);

      // Log the error response with more details
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: 500,
            error: String(error),
            details: {
              url: apiUrl,
              vertexId,
              curve,
              roomUuid,
              keyId,
              n,
              t,
            },
          },
          true
        );
      }

      throw error;
    }
  }

  // We use the functions above to create a keypair.
  private async keygenVertex(curve: "ecdsa" | "ed25519") {
    // We create a room for key generation.
    const roomUuid = await this.createRoomWithVertex(0, this.n);
    // We collect the keygenIds and keyIds from all Vertex servers.
    const initKeygenResults = await Promise.all(
      [...Array(this.n).keys()].map(async (i) =>
        this.keygenInitWithVertex(i, curve)
      )
    );
    const keygenIds = initKeygenResults.map((r) => r.keygen_id);
    const keyIds = initKeygenResults.map((r) => r.key_id);
    // We tell all Vertex servers to participate in key generation.
    await Promise.all(
      [...Array(this.n).keys()].map(async (i) =>
        this.keygenWithVertex(
          i,
          roomUuid,
          initKeygenResults[i].key_id,
          this.n,
          this.t,
          keygenIds.filter((_, j) => j !== i),
          curve
        )
      )
    );
    // We return the keyIds to use for signing later.
    return keyIds;
  }

  private async signWithVertex(
    vertexId: number,
    roomUuid: string,
    keyId: string,
    msg: string,
    derivationPath: number[],
    curve: "ecdsa" | "ed25519",
    hashMethod?: string
  ) {
    // Determine the API URL based on the environment
    const apiUrl = isProduction()
      ? `${this.SODOT_VERTICES[vertexId].url}/${curve}/sign?vertex=${
          (this.SODOT_VERTICES[vertexId] as any).vertexParam
        }`
      : `${this.SODOT_VERTICES[vertexId].url}/${curve}/sign`;

    let logId = -1;

    // Ensure the message is properly formatted
    // If it's a JSON string, we need to escape it properly
    let formattedMsg = msg;
    try {
      // Check if the message is a JSON string
      JSON.parse(msg);
      // If it is, we need to escape it
      formattedMsg = JSON.stringify(msg);
    } catch (e) {
      // If it's not a JSON string, just remove the 0x prefix if present
      formattedMsg = msg.replace("0x", "");
    }

    const body: any = {
      room_uuid: roomUuid,
      key_id: keyId,
      msg: formattedMsg,
      derivation_path: derivationPath,
    };

    if (curve === "ecdsa" && hashMethod) {
      body.hash_algo = hashMethod;
    }

    // Log the API call
    if (apiLogsInstance) {
      logId = logApiCall(
        apiLogsInstance,
        "Sodot",
        apiUrl,
        "POST",
        body,
        "Sign Transaction"
      );
    }

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify(body),
        mode: "cors",
      };

      const response = await fetch(apiUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error signing transaction: ${errorText}`);
        console.error(`Status: ${response.status}`);

        // Log the error response with more details
        if (apiLogsInstance && logId !== -1) {
          logApiResponse(
            apiLogsInstance,
            logId,
            {
              status: response.status,
              error: errorText,
              details: {
                url: apiUrl,
                responseType: response.type,
                statusText: response.statusText,
                vertexId,
                curve,
              },
            },
            true
          );
        }

        return undefined;
      }

      const signature = (await response.json()) as SodotSignatureResponse;

      // Log the successful response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(apiLogsInstance, logId, {
          status: response.status,
          data: signature,
        });
      }

      return signature;
    } catch (e) {
      console.error(`Error in signWithVertex: ${e}`);

      // Log the error with more details
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: 500,
            error: String(e),
            details: {
              url: apiUrl,
              vertexId,
              keyId,
              curve,
              roomUuid,
            },
          },
          true
        );
      }

      errorTerminal(
        `Failed to sign message with Vertex ${vertexId}: ${e}`,
        this.signerName
      );
      throw e;
    }
  }

  private async sign(
    message: string,
    keyIds: string[],
    derivationPath: number[],
    curve: AdamikCurve,
    hashAlgo?: string
  ) {
    // We create a room for signing.
    infoTerminal("Creating room with Vertex...", this.signerName);
    const roomUuid = await this.createRoomWithVertex(0, this.n);
    // We tell all Vertex servers to particpate in signing the message.
    infoTerminal("Signing message with Vertex...", this.signerName);
    const signatures = await Promise.all(
      keyIds.map(async (keyId, i) =>
        this.signWithVertex(
          i,
          roomUuid,
          keyId,
          message,
          derivationPath,
          this.adamikCurveToSodotCurve(curve),
          hashAlgo
        )
      )
    );
    infoTerminal("Message signed with Vertex.", this.signerName);
    // We return only one of the signatures as these are identical.
    return signatures[0];
  }

  private adamikHashFunctionToSodotHashMethod(
    hashAlgo: AdamikHashFunction,
    curve: AdamikCurve
  ): "sha256" | "keccak256" | undefined {
    if (curve === AdamikCurve.ED25519) {
      return undefined;
    }
    switch (hashAlgo) {
      case AdamikHashFunction.SHA256:
        return "sha256";
      case AdamikHashFunction.KECCAK256:
        return "keccak256";
      default:
        throw new Error(`Unsupported hash algorithm: ${hashAlgo}`);
    }
  }

  private async derivePubkeyWithVertex(
    vertexId: number,
    keyId: string,
    derivationPath: number[],
    curve: "ecdsa" | "ed25519"
  ) {
    // Determine the API URL based on the environment
    const apiUrl = isProduction()
      ? `${this.SODOT_VERTICES[vertexId].url}/${curve}/derive-pubkey?vertex=${
          (this.SODOT_VERTICES[vertexId] as any).vertexParam
        }`
      : `${this.SODOT_VERTICES[vertexId].url}/${curve}/derive-pubkey`;

    let logId = -1;

    const requestBody = {
      key_id: keyId,
      derivation_path: Array.from(derivationPath),
    };

    // Log the API call
    if (apiLogsInstance) {
      logId = logApiCall(
        apiLogsInstance,
        "Sodot",
        apiUrl,
        "POST",
        requestBody,
        "Derive Public Key"
      );
    }

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
      };

      const response = await fetch(apiUrl, fetchOptions);

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(`Error deriving pubkey: ${errorMessage}`);
        console.error(`Status: ${response.status}`);

        // Log the error response
        if (apiLogsInstance && logId !== -1) {
          logApiResponse(
            apiLogsInstance,
            logId,
            {
              status: response.status,
              error: errorMessage,
              details: {
                url: apiUrl,
                responseType: response.type,
                statusText: response.statusText,
              },
            },
            true
          );
        }

        throw new Error(`Failed to derive pubkey: ${errorMessage}`);
      }

      const pubkey = await response.json();

      // Log the successful response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(apiLogsInstance, logId, {
          status: response.status,
          data: pubkey,
        });
      }

      // For ed25519 keys
      if ("pubkey" in pubkey) {
        return pubkey.pubkey;
      }

      // For secp256k1 keys (including Bitcoin)
      if ("compressed" in pubkey) {
        return pubkey.compressed;
      }

      throw new Error(`Unexpected pubkey format: ${JSON.stringify(pubkey)}`);
    } catch (error) {
      console.error(`Error in derivePubkeyWithVertex: ${error}`);

      // Log the error response
      if (apiLogsInstance && logId !== -1) {
        logApiResponse(
          apiLogsInstance,
          logId,
          {
            status: 500,
            error: String(error),
            details: {
              url: apiUrl,
              vertexId,
              keyId,
              curve,
            },
          },
          true
        );
      }

      throw error;
    }
  }
}
