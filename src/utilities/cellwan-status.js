export default async (serverUrl, cookieSession) => {
  const result = await fetch(`${serverUrl}/cgi-bin/DAL?oid=cellwan_status`, {
    method: "GET",
    headers: { cookie: `Session=${cookieSession}` },
  });

  if (result.status !== 200) {
    throw new Error("Error while fetching stats.");
  }

  return await result.json();
};
