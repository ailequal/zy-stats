import type { Browser } from "puppeteer-core";

/**
 * Retrieves the value of a named cookie from a Puppeteer browser instance.
 *
 * @param browser - The Puppeteer browser instance.
 * @param cookieName - The name of the cookie to retrieve.
 * @returns The cookie value, or `null` if not found.
 */
export default async (browser: Browser, cookieName: string): Promise<string | null> => {
  const cookies = await browser.cookies();
  const cookieValue = cookies.find((cookie) => cookie.name === cookieName);

  return cookieValue ? cookieValue.value : null;
};
