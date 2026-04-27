import { fetch } from "undici";
import type { CellwanStatusResponse, EncryptedResponse } from "../types.ts";
import dxc from "./dxc.ts";
import httpsAgent from "./https-agent.ts";

/**
 * Fetches the cellwan status from the Zyxel router API.
 *
 * When an `aesKey` is provided the response is assumed to be AES-encrypted
 * (older router models such as the LTE5398-M904) and will be decrypted
 * before parsing.
 *
 * @param serverUrl - The router's base URL.
 * @param cookieSession - The session cookie value.
 * @param aesKey - Optional AES key for decrypting encrypted responses.
 * @returns The parsed cellwan status response.
 * @throws {Error} If the HTTP response status is not 200.
 */
export default async (
  serverUrl: string,
  cookieSession: string,
  aesKey?: string,
): Promise<CellwanStatusResponse> => {
  const result = await fetch(`${serverUrl}/cgi-bin/DAL?oid=cellwan_status`, {
    method: "GET",
    headers: { cookie: `Session=${cookieSession}` },
    dispatcher: httpsAgent,
  });

  if (result.status !== 200) {
    throw new Error("Error while fetching stats.");
  }

  // Older routers return an AES-encrypted payload that must be decrypted first.
  if (aesKey) {
    const { content, iv } = (await result.json()) as EncryptedResponse;
    return JSON.parse(dxc(content, aesKey, iv)) as CellwanStatusResponse;
  }

  return result.json() as Promise<CellwanStatusResponse>;
};
