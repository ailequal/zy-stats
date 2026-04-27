#!/usr/bin/env -S node --env-file=.env

import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer-core";
import { setTimeout } from "timers/promises";
import { fileURLToPath } from "url";
import { parseArgs } from "node:util";
import type { AppOptions, DeviceType } from "./types.ts";
import cellwanStatus from "./utilities/cellwan-status.ts";
import generateStats from "./utilities/generate-stats.ts";
import getCookie from "./utilities/get-cookie-value.ts";
import getLocalStorageValue from "./utilities/get-local-storage-value.ts";
import getLogFilePath from "./utilities/get-log-file-path.ts";
import loginCheck from "./utilities/login-check.ts";
import maybeCreateLogsDir from "./utilities/maybe-create-logs-dir.ts";

// Global constants.
// System Chromium path (only with Docker).
const CHROMIUM_PATH = process.env.CHROMIUM_PATH;
// Name of the session cookie set by the Zyxel router.
const SESSION_COOKIE_NAME = "Session";
// localStorage key that holds the AES encryption key (varies by router model).
const AES_KEY_LOCAL_STORAGE_KEY: Record<DeviceType, string> = {
  fwa505: "zySessionKey",
  lte5398: "AesKey",
};

// Create the `/logs` directory at the root of the project.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, "..", "logs");

/**
 * Main application logic.
 *
 * Launches a headless browser to log into the Zyxel router, retrieves the
 * session cookie and AES key, then starts a polling loop that periodically
 * fetches and displays (or logs) network statistics.
 *
 * @param options - CLI options parsed by parseArgs.
 */
const app = async ({ headless, serverUrl, username, password, interval, log, device }: AppOptions): Promise<void> => {
  const browser = await puppeteer.launch({
    ...(CHROMIUM_PATH
      ? {
          executablePath: CHROMIUM_PATH,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        }
      : { channel: "chrome" as puppeteer.ChromeReleaseChannel }),
    headless: headless,
    acceptInsecureCerts: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(serverUrl);
  } catch (error) {
    await browser.close();
    console.error(`Failed to navigate to "${serverUrl}".`, error);
    process.exit(1);
  }
  await page.setViewport({ width: 1080, height: 1024 });

  await page.locator("#username").fill(username);
  await page.locator("#userpassword").fill(password);
  await page.locator("#loginBtn").click();

  // Check the presence of the LAN MAC address element to determine if the login was successful.
  await page.waitForSelector("#card_sysinfo_macaddr", { visible: true });

  const session = await getCookie(browser, SESSION_COOKIE_NAME);
  const aesKey = await getLocalStorageValue(page, AES_KEY_LOCAL_STORAGE_KEY[device]);
  await browser.close();

  // When running with Docker, the router's embedded web server needs a moment
  // to release the connections opened by Chromium before it can accept new ones.
  if (CHROMIUM_PATH) await setTimeout(3000);

  if (!session || !aesKey) {
    console.error("Failed to retrieve session or/and AES key.");
    process.exit(1);
  }

  try {
    await maybeCreateLogsDir(LOGS_DIR);
    const loginCheckData = await loginCheck(serverUrl, session);
    console.log("loginCheckData", loginCheckData);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  // Graceful shutdown via AbortController.
  // Handles both Ctrl+C (SIGINT) and termination signals (SIGTERM).
  const ac = new AbortController();
  const { signal } = ac;
  const shutdown = () => {
    console.log("\nShutting down...");
    ac.abort();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Main logic.
  const loop = async (): Promise<void> => {
    console.clear();

    const statsJson = await cellwanStatus(serverUrl, session, device === "lte5398" ? aesKey! : undefined);

    if (!log) {
      console.log(generateStats(statsJson, "pretty"));
    } else {
      console.log("Logging stats to file...");
      const statsToLog = generateStats(statsJson, "json");
      console.log(statsToLog);

      const logFilePath = getLogFilePath(LOGS_DIR);
      const logEntry = JSON.stringify(statsToLog) + "\n";
      await fs.appendFile(logFilePath, logEntry);
      console.log(`Stats logged to "${logFilePath}".`);
    }
  };

  // Run once immediately, then wait for the interval before repeating.
  try {
    while (!signal.aborted) {
      await loop();
      await setTimeout(interval * 1000, null, { signal });
    }
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      process.exit(0);
    }

    console.error(error);
    process.exit(1);
  }
};

// Access environment variables.
const appVersion = process.env.npm_package_version;
const serverUrl = process.env.SERVER_URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const interval = process.env.INTERVAL;
const device = process.env.DEVICE;

// Command-line interface setup.
const { values } = parseArgs({
  options: {
    "no-headless": { type: "boolean" },
    "server-url": { type: "string", short: "s" },
    username: { type: "string", short: "u" },
    password: { type: "string", short: "p" },
    interval: { type: "string", short: "i" },
    log: { type: "boolean", short: "l" },
    device: { type: "string", short: "d" },
    version: { type: "boolean", short: "V" },
    help: { type: "boolean", short: "h" },
  },
  strict: true,
});

if (values.version) {
  console.log(appVersion ?? "");
  process.exit(0);
}

if (values.help) {
  console.log(`Usage: zy-stats [options]

Fetch Zyxel's stats from the CLI.

Options:
  -V, --version              output the version number
  --no-headless              disable headless mode
  -s, --server-url <url>     server URL
  -u, --username <username>  username for login
  -p, --password <password>  password for login
  -i, --interval <seconds>   interval in seconds for fetching stats
  -l, --log                  log stats into a file (default: false)
  -d, --device <model>       router model: fwa505, lte5398 (default: fwa505)
  -h, --help                 display help for command`);
  process.exit(0);
}

app({
  headless: !values["no-headless"],
  serverUrl: (values["server-url"] ?? serverUrl) as string,
  username: (values.username ?? username) as string,
  password: (values.password ?? password) as string,
  interval: Number(values.interval ?? interval),
  log: values.log ?? false,
  device: (values.device ?? device ?? "fwa505") as DeviceType,
});
