export default async (browser, cookieName) => {
  const cookies = await browser.cookies();
  const cookieValue = cookies.find((cookie) => cookie.name === cookieName);

  return cookieValue ? cookieValue.value : null;
};
