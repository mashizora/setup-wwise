import { createVerify } from "node:crypto";

const LOGIN_URL = "https://www.audiokinetic.com/wwise/launcher/?action=login";
const WWISE_PRODUCT_BASEURL =
  "https://blob-api.gowwise.com/v2/products/versions/wwise.";

const PUBLIC_KEY =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnAYv/1xDhJ39iT7Ftzcv\n" +
  "zXmhZRHkw5fbMPvz65z0Zh30yZCCmi5RZ0ds5kLcNdov0cdRkhPkWGkWe9/G+dkX\n" +
  "54DRMdvgIcuvmpAgxKz3re1vuTZHvz1DR2sy5FpSPV6lsX3CRLpaXzEo9fgYdqyB\n" +
  "cnqeOaq1byeNTMp2uRUF84NzkH2A3x6Vxx6pThdVMAVKbvPUhEtSBARAKxQstCkQ\n" +
  "ut8FlvQm2RgJrwbmXQfloz4h7uPwaM2jD2eApCfXHK05xh+1zMWFu6oqhqkfKUIK\n" +
  "GceEwONPkd039fwirfgKjbD5iGli3AuNn6PFVqyK0tcG/qYhjNVtJLCsHSmHyipD\n" +
  "rQIDAQAB\n" +
  "-----END PUBLIC KEY-----";

interface RawResult {
  payload: string;
  signature: string;
}

interface DecodedResult {}

interface LoginResult extends DecodedResult {
  jwt: string;
}

interface ProductResult extends DecodedResult {
  statusCode: number;
  data: ProductInfo;
}

// Only properties we need are typed.
interface ProductInfo {
  files: {
    url: string;
    name: string;
    sha1: string;
  }[];
}

async function decodeResponse<T extends DecodedResult>(
  response: Response
): Promise<T> {
  const { payload, signature } = (await response.json()) as RawResult;
  const isValid = createVerify("RSA-SHA1")
    .update(payload, "base64")
    .verify(PUBLIC_KEY, signature, "base64");
  if (!isValid) {
    throw Error("Invalid signature from Audiokinetic API.");
  }
  return JSON.parse(atob(payload));
}

async function getToken(email?: string, password?: string): Promise<string> {
  const resp = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await decodeResponse<LoginResult>(resp);
  return result.jwt;
}

/**
 * Get wwise product info from audiokinetic launcher api.
 *
 * @param version Wwise version to request, in `<year>.<major>.<minor>.<build>` format.
 * @param email Email address of audiokinetic account,
 * @param password Password of audiokinetic account.
 * @returns Wwise product info of requested version.
 */
export async function getWwiseProductInfo(
  version: string,
  email?: string,
  password?: string
): Promise<ProductInfo> {
  const token = await getToken(email, password);
  const url = WWISE_PRODUCT_BASEURL + version.replaceAll(".", "_");
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const { statusCode, data } = await decodeResponse<ProductResult>(resp);
  if (statusCode !== 200) {
    throw Error(`Unsuccessful response ${statusCode} from Audiokinetic API.`);
  }
  return data;
}
