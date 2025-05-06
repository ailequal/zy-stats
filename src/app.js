import "dotenv/config";
import { cellwanStatus } from "./utilities/cellwan-status.js";
import { dxc } from "./utilities/dxc.js";
import { loginCheck } from "./utilities/login-check.js";

const app = async () => {
  const serverUrl = process.env.SERVER_URL;
  const aesKey = process.env.AES_KEY;
  const cookieSession = process.env.COOKIE_SESSION;

  let loginCheckData;
  try {
    loginCheckData = await loginCheck(serverUrl, cookieSession);
  } catch (error) {
    console.log(error.message);
    return;
  }
  console.log("loginCheckData", loginCheckData);

  let statsData;
  try {
    statsData = await cellwanStatus(serverUrl, cookieSession);
  } catch (error) {
    console.log(error.message);
    return;
  }
  const { content, iv } = statsData;

  let decrypted;
  try {
    decrypted = dxc(content, aesKey, iv);
  } catch (error) {
    console.log(error.message);
    return;
  }
  console.log("statsData", decrypted);
};

await app();
