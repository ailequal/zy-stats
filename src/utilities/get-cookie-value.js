/**
 * Retrieves the value of a named cookie from a Puppeteer browser instance.
 *
 * @param {import("puppeteer-core").Browser} browser - The Puppeteer browser instance.
 * @param {string} cookieName - The name of the cookie to retrieve.
 * @returns {Promise<string | null>} The cookie value, or `null` if not found.
 */
export default async (browser, cookieName) => {
  const cookies = await browser.cookies();
  const cookieValue = cookies.find((cookie) => cookie.name === cookieName);

  return cookieValue ? cookieValue.value : null;
};
