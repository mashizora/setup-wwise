import { createVerify } from "node:crypto";

const ENDPOINT_LOGIN =
  "https://www.audiokinetic.com/wwise/launcher/?action=login";
const ENDPOINT_PRODUCT_LIST =
  "https://blob-api.gowwise.com/products/versions?category=wwise";
const ENDPOINT_PRODUCT_BASE =
  "https://blob-api.gowwise.com/v2/products/versions/";

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

interface ProductList {
  bundles: {
    id: string;
    versionTag: string;
    version: {
      year: number;
      major: number;
      minor: number;
      build: number;
    };
  }[];
}

interface ProductData {
  files: {
    id: string;
    url: string;
    name: string;
    sha1: string;
  }[];
}

async function decodeResponse(response: Response): Promise<any> {
  if (!response.ok) {
    throw new Error(`Unsuccessful status ${response.status}.`);
  }

  const data = await response.json();
  if (!data.payload || !data.signature) {
    throw new Error("Unsigned response from audiokinetic api.");
  }

  const verify = createVerify("RSA-SHA1").update(data.payload, "base64");
  if (!verify.verify(PUBLIC_KEY, data.signature, "base64")) {
    throw new Error("Invalid signature from audiokinetic api.");
  }

  return JSON.parse(atob(data.payload));
}

async function getToken(email?: string, password?: string): Promise<string> {
  const response = await fetch(ENDPOINT_LOGIN, {
    method: "POST",
    headers: { ["Content-Type"]: "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(decodeResponse);

  return response.jwt;
}

/**
 * Get wwise product list from audiokinetic launcher api.
 * @returns Wwise product info matches specified version.
 */
export async function getProductList(): Promise<ProductList> {
  const token = await getToken();
  const response = await fetch(ENDPOINT_PRODUCT_LIST, {
    headers: {
      ["Authorization"]: `Bearer ${token}`,
      ["Content-Type"]: "application/json",
    },
  }).then(decodeResponse);

  if (response.statusCode < 200 || response.statusCode > 399) {
    throw new Error(`Unsuccessful status ${response.statusCode}.`);
  }

  return response.data as ProductList;
}

/**
 * Get wwise product data from audiokinetic launcher api.
 * @param id Wwise product id to request.
 * @param email Email address of audiokinetic account.
 * @param password Password of audiokinetic account.
 * @returns Wwise product info of requested version.
 */
export async function getProductData(
  id: string,
  email?: string,
  password?: string
): Promise<ProductData> {
  const token = await getToken(email, password);
  const response = await fetch(ENDPOINT_PRODUCT_BASE + id, {
    headers: {
      ["Authorization"]: `Bearer ${token}`,
      ["Content-Type"]: "application/json",
    },
  }).then(decodeResponse);

  if (response.statusCode < 200 || response.statusCode > 399) {
    throw new Error(`Unsuccessful status ${response.statusCode}.`);
  }

  return response.data as ProductData;
}
