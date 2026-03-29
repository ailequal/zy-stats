#!/usr/bin/env -S node --env-file=.env

import { program } from "commander";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer-core";
import { setTimeout } from "timers/promises";
import { fileURLToPath } from "url";
import type { AppOptions } from "./types.ts";
import cellwanStatus from "./utilities/cellwan-status.ts";
import generateStats from "./utilities/generate-stats.ts";
import getCookie from "./utilities/get-cookie-value.ts";
import getLocalStorageValue from "./utilities/get-local-storage-value.ts";
import getLogFilePath from "./utilities/get-log-file-path.ts";
import loginCheck from "./utilities/login-check.ts";
import maybeCreateLogsDir from "./utilities/maybe-create-logs-dir.ts";

// Global constants.
/** Puppeteer browser channel to launch. */
const PUPPETEER_CHANNEL: puppeteer.ChromeReleaseChannel = "chrome";
/** Name of the session cookie set by the Zyxel router. */
const SESSION_COOKIE_NAME = "Session";
/** localStorage key that holds the AES encryption key. */
const AES_KEY_LOCAL_STORAGE_KEY = "zySessionKey";

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
 * @param options - CLI options parsed by Commander.
 */
const app = async ({ headless, serverUrl, username, password, interval, log }: AppOptions): Promise<void> => {
  const browser = await puppeteer.launch({ channel: PUPPETEER_CHANNEL, headless: headless, acceptInsecureCerts: true });
  const page = await browser.newPage();

  await page.goto(serverUrl);
  await page.setViewport({ width: 1080, height: 1024 });

  await page.locator("#username").fill(username);
  await page.locator("#userpassword").fill(password);
  await page.locator("#loginBtn").click();

  // Check the presence of the LAN MAC address element to determine if the login was successful.
  await page.waitForSelector("#card_sysinfo_macaddr", { visible: true });

  const session = await getCookie(browser, SESSION_COOKIE_NAME);
  const aesKey = await getLocalStorageValue(page, AES_KEY_LOCAL_STORAGE_KEY);
  await browser.close();

  if (!session || !aesKey) {
    console.error("Failed to retrieve session or/and AES key.");
    process.exit(1);
  }

  try {
    await maybeCreateLogsDir(LOGS_DIR);

    const loginCheckData = await loginCheck(serverUrl, session);
    console.log("loginCheckData", loginCheckData);
  } catch (error) {
    console.error((error as Error).message);
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

    const statsJson = await cellwanStatus(serverUrl, session);

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

    console.error((error as Error).message);
    process.exit(1);
  }
};

// Access environment variables.
const appVersion = process.env.npm_package_version;
const serverUrl = process.env.SERVER_URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const interval = process.env.INTERVAL;

// Command-line interface setup.
program
  .name("zy-stats")
  .description(`Fetch Zyxel's stats from the CLI.`)
  .version(appVersion ?? "")
  .option("--no-headless", "disable headless mode")
  .option("-s, --server-url <url>", "server URL", serverUrl)
  .option("-u, --username <username>", "username for login", username)
  .option("-p, --password <password>", "password for login", password)
  .option("-i, --interval <seconds>", "interval in seconds for fetching stats", interval)
  .option("-l, --log", "log stats into a file", false)
  .action((options: AppOptions) => app(options));
program.parse();
