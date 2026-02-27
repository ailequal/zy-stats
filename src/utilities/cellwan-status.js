import httpsAgent from "./https-agent.js";

/**
 * Fetches the cellwan status from the Zyxel router API.
 *
 * @param {string} serverUrl - The router's base URL.
 * @param {string} cookieSession - The session cookie value.
 * @returns {Promise<import("../types.js").CellwanStatusResponse>} The parsed cellwan status response.
 * @throws {Error} If the HTTP response status is not 200.
 */
export default async (serverUrl, cookieSession) => {
  const result = await fetch(`${serverUrl}/cgi-bin/DAL?oid=cellwan_status`, {
    method: "GET",
    headers: { cookie: `Session=${cookieSession}` },
    // @ts-expect-error -- `dispatcher` is a valid undici/Node.js fetch option not covered by the standard RequestInit types.
    dispatcher: httpsAgent,
  });

  if (result.status !== 200) {
    throw new Error("Error while fetching stats.");
  }

  return await result.json();
};
