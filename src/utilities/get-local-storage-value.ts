import type { Page } from "puppeteer-core";

/**
 * Retrieves a value from `localStorage` via a Puppeteer page.
 *
 * The function evaluates a script in the browser context that reads all
 * `localStorage` entries and returns the one matching the given key.
 *
 * @param page - The Puppeteer page instance.
 * @param itemKey - The `localStorage` key to look up.
 * @returns The stored value, or `undefined` if the key does not exist.
 */
export default async (page: Page, itemKey: string): Promise<string | undefined> => {
  const localStorageData = await page.evaluate(() => {
    const json: Record<string, string | null> = {};

    // `localStorage` is available here thanks to the `page.evaluate()` method.
    // @link "https://scrapingant.com/blog/puppeteer-local-storage#accessing-local-storage-with-puppeteer"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        json[key] = localStorage.getItem(key);
      }
    }

    return json;
  });

  return localStorageData[itemKey] ?? undefined;
};
