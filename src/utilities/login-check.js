export const loginCheck = async (serverUrl, cookieSession) => {
  const result = await fetch(`${serverUrl}/cgi-bin/UserLoginCheck`, {
    method: "GET",
    headers: { cookie: `Session=${cookieSession}` },
  });

  if (result.status !== 200) {
    throw new Error("Login check failed. Check your credentials in the `.env` file.");
  }

  return await result.json();
};
