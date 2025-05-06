export const login = async (serverUrl, username, password) => {
  // TODO: The login flow from the CLI is tricky, for now manually set the `aesKey` and the `cookieSession`.
  void username, password;

  const result = await fetch(`${serverUrl}/UserLogin`, {
    method: "POST",
    body: '{"content":"ccc","key":"kkk","iv":"iii"}',
  });
  console.log("result", result);

  const data = await result.json();
  console.log("data", data);
};
