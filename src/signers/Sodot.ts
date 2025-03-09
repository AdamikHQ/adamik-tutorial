import {
  AdamikCurve,
  AdamikHashFunction,
  AdamikSignerSpec,
} from "../adamik/types";
import {
  errorTerminal,
  extractSignature,
  infoTerminal,
  italicInfoTerminal,
} from "../utils";
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

export class SodotSigner implements BaseSigner {
  public chainId: string;
  public signerSpec: AdamikSignerSpec;
  public signerName = Signer.SODOT;

  // TODO: Make this configurable and extendable
  private SODOT_VERTICES = [
    {
      url: process.env.SODOT_VERTEX_URL_0!,
      apiKey: process.env.SODOT_VERTEX_API_KEY_0!,
    },
    {
      url: process.env.SODOT_VERTEX_URL_1!,
      apiKey: process.env.SODOT_VERTEX_API_KEY_1!,
    },
    {
      url: process.env.SODOT_VERTEX_URL_2!,
      apiKey: process.env.SODOT_VERTEX_API_KEY_2!,
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
        this.keyIds =
          process.env.SODOT_EXISTING_ECDSA_KEY_IDS?.split(",") || [];
        break;
      case AdamikCurve.ED25519:
        this.keyIds =
          process.env.SODOT_EXISTING_ED25519_KEY_IDS?.split(",") || [];
        break;
      default:
        throw new Error(`Unsupported curve: ${signerSpec.curve}`);
    }
  }

  static isConfigValid(): boolean {
    if (!process.env.SODOT_VERTEX_API_KEY_0) {
      throw new Error("SODOT_VERTEX_API_KEY_0 is not set");
    }
    if (!process.env.SODOT_VERTEX_API_KEY_1) {
      throw new Error("SODOT_VERTEX_API_KEY_1 is not set");
    }
    if (!process.env.SODOT_VERTEX_API_KEY_2) {
      throw new Error("SODOT_VERTEX_API_KEY_2 is not set");
    }

    return true;
  }

  public async getPubkey(): Promise<string> {
    // If we no keyids is provided, we generate a new keypair.
    if (this.keyIds.length === 0) {
      infoTerminal("Generating new keypair...", this.signerName);
      this.keyIds = await this.keygenVertex(
        this.adamikCurveToSodotCurve(this.signerSpec.curve)
      );
      infoTerminal("Key generation completed.", this.signerName);

      if (this.signerSpec.curve === AdamikCurve.SECP256K1) {
        infoTerminal(
          "please use SODOT_EXISTING_ECDSA_KEY_IDS to be able to reuse the same keys",
          this.signerName
        );
        await italicInfoTerminal(
          `export SODOT_EXISTING_ECDSA_KEY_IDS="${this.keyIds.join(",")}"`,
          1000
        );
        infoTerminal(`keyIds: ${this.keyIds}`, this.signerName);
      } else if (this.signerSpec.curve === AdamikCurve.ED25519) {
        infoTerminal(
          "please use SODOT_EXISTING_ED25519_KEY_IDS to be able to reuse the same keys",
          this.signerName
        );
        await italicInfoTerminal(
          `export SODOT_EXISTING_ED25519_KEY_IDS="${this.keyIds.join(",")}"`,
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
    const response = await fetch(
      `${this.SODOT_VERTICES[vertexId].url}/create-room`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify({
          room_size: roomSize,
        }),
      }
    );
    const roomUuid = (await response.json()) as { room_uuid: string };
    return roomUuid.room_uuid;
  }

  private async keygenInitWithVertex(
    vertexId: number,
    curve: "ecdsa" | "ed25519"
  ): Promise<{
    key_id: string;
    keygen_id: string;
  }> {
    return (await (
      await fetch(`${this.SODOT_VERTICES[vertexId].url}/${curve}/create`, {
        headers: { Authorization: this.SODOT_VERTICES[vertexId].apiKey },
      })
    ).json()) as {
      key_id: string;
      keygen_id: string;
    };
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
    const response = await fetch(
      `${this.SODOT_VERTICES[vertexId].url}/${curve}/keygen`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify({
          room_uuid: roomUuid,
          key_id: keyId,
          num_parties: n,
          threshold: t,
          others_keygen_ids: othersKeygenIds,
        }),
      }
    );

    if (response.status !== 200) {
      const error = await response.text();
      throw new Error(
        `Failed to generate key for Vertex ${vertexId}: ${error}`
      );
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
    const body: any = {
      room_uuid: roomUuid,
      key_id: keyId,
      msg: msg.replace("0x", ""),
      derivation_path: derivationPath,
    };

    if (curve === "ecdsa" && hashMethod) {
      body.hash_algo = hashMethod;
    }

    try {
      const response = await fetch(
        `${this.SODOT_VERTICES[vertexId].url}/${curve}/sign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.SODOT_VERTICES[vertexId].apiKey,
          },
          body: JSON.stringify(body),
        }
      );
      if (response.status !== 200) {
        const error = await response.text();
        console.log(error);
        console.log({ status: response.status });
        return undefined;
      }

      const signature = (await response.json()) as SodotSignatureResponse;
      return signature;
    } catch (e) {
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
    const response = await fetch(
      `${this.SODOT_VERTICES[vertexId].url}/${curve}/derive-pubkey`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.SODOT_VERTICES[vertexId].apiKey,
        },
        body: JSON.stringify({
          key_id: keyId,
          derivation_path: Array.from(derivationPath),
        }),
      }
    );
    const pubkey = (await response.json()) as
      | {
          uncompressed: string;
          compressed: string;
        }
      | { pubkey: string };

    if ("pubkey" in pubkey) {
      return pubkey.pubkey;
    }

    return pubkey.compressed;
  }
}
