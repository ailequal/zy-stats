/* eslint-disable no-undef */

/**
 * Retrieves a value from `localStorage` via a Puppeteer page.
 *
 * The function evaluates a script in the browser context that reads all
 * `localStorage` entries and returns the one matching the given key.
 *
 * @param {import("puppeteer-core").Page} page - The Puppeteer page instance.
 * @param {string} itemKey - The `localStorage` key to look up.
 * @returns {Promise<string | undefined>} The stored value, or `undefined` if the key does not exist.
 */
export default async (page, itemKey) => {
  const localStorageData = await page.evaluate(() => {
    let json = {};

    // `localStorage` is available here thanks to the `page.evaluate()` method.
    // @link "https://scrapingant.com/blog/puppeteer-local-storage#accessing-local-storage-with-puppeteer"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }

    return json;
  });

  return localStorageData[itemKey];
};
