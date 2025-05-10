import { program } from "commander";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { cellwanStatus } from "./utilities/cellwan-status.js";
import { generateStats } from "./utilities/display-stats.js";
import { dxc } from "./utilities/dxc.js";
import { getLogFilePath } from "./utilities/get-log-file-path.js";
import { loginCheck } from "./utilities/login-check.js";
import { maybeCreateLogsDir } from "./utilities/maybe-create-logs-dir.js";

// Access environment variables.
const serverUrl = process.env.SERVER_URL;
const aesKey = process.env.AES_KEY;
const cookieSession = process.env.COOKIE_SESSION;
const interval = process.env.INTERVAL;

// Create the `/logs` directory at the root of the project.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, "..", "logs");

// Main application logic.
const app = async (log) => {
  if (log) {
    try {
      await maybeCreateLogsDir(logsDir);
    } catch (error) {
      console.log(error.message);
      return;
    }
  }

  let loginCheckData;
  try {
    loginCheckData = await loginCheck(serverUrl, cookieSession);
  } catch (error) {
    console.log(error.message);
    return;
  }
  console.log("loginCheckData", loginCheckData);

  let intervalId;
  const loop = async () => {
    console.clear();

    let statsData;
    try {
      statsData = await cellwanStatus(serverUrl, cookieSession);
    } catch (error) {
      console.log(error.message);
      clearInterval(intervalId);
      return;
    }
    const { content, iv } = statsData;

    let statsJson;
    try {
      const statsDecrypted = dxc(content, aesKey, iv);
      statsJson = JSON.parse(statsDecrypted);
    } catch (error) {
      console.log(error.message);
      clearInterval(intervalId);
      return;
    }

    if (!log) {
      console.log(generateStats(statsJson, "pretty"));
    } else {
      console.log("Logging stats to file...");
      const statsToLog = generateStats(statsJson, "json");
      console.log(statsToLog);
      const logFilePath = getLogFilePath(logsDir);

      try {
        const logEntry = JSON.stringify(statsToLog) + "\n";
        await fs.appendFile(logFilePath, logEntry);
        console.log(`Stats logged to "${logFilePath}".`);
      } catch (error) {
        console.error(error.message);
        clearInterval(intervalId);
      }
    }
  };
  console.log("Waiting for the first interval...");
  intervalId = setInterval(loop, interval * 1000);
};

// Command-line interface setup.
program
  .name("zy-stats")
  .description(`Fetch Zyxel's stats from the CLI.`)
  .version("1.0.0")
  .option("-l, --log", "log stats into a file")
  .action(async (options) => {
    await app(!!options.log);
  });
program.parse();
