import httpsAgent from "./https-agent.js";

/**
 * Checks whether the current session is still valid by calling the
 * Zyxel login-check endpoint.
 *
 * @param {string} serverUrl - The router's base URL.
 * @param {string} cookieSession - The session cookie value.
 * @returns {Promise<Object>} The parsed JSON response from the login check.
 * @throws {Error} If the HTTP response status is not 200.
 */
export default async (serverUrl, cookieSession) => {
  const result = await fetch(`${serverUrl}/cgi-bin/UserLoginCheck`, {
    method: "GET",
    headers: { cookie: `Session=${cookieSession}` },
    // @ts-expect-error -- `dispatcher` is a valid undici/Node.js fetch option not covered by the standard RequestInit types.
    dispatcher: httpsAgent,
  });

  if (result.status !== 200) {
    throw new Error("Login check failed. Check your credentials in the `.env` file.");
  }

  return await result.json();
};
