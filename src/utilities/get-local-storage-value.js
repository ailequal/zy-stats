/* eslint-disable no-undef */

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
