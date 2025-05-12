#!/usr/bin/env node

import { program } from "commander";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "url";
import cellwanStatus from "./utilities/cellwan-status.js";
import dxc from "./utilities/dxc.js";
import generateStats from "./utilities/generate-stats.js";
import getCookie from "./utilities/get-cookie-value.js";
import getLocalStorageValue from "./utilities/get-local-storage-value.js";
import getLogFilePath from "./utilities/get-log-file-path.js";
import loginCheck from "./utilities/login-check.js";
import maybeCreateLogsDir from "./utilities/maybe-create-logs-dir.js";

// Global constants.
const PUPPETEER_CHANNEL = "chrome";
const SESSION_COOKIE_NAME = "Session";
const AES_KEY_LOCAL_STORAGE_KEY = "AesKey";

// Create the `/logs` directory at the root of the project.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, "..", "logs");

// Main application logic.
const app = async ({ headless, serverUrl, username, password, interval, log }) => {
  const browser = await puppeteer.launch({ channel: PUPPETEER_CHANNEL, headless: headless });
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
    console.error(error.message);
    process.exit(1);
  }

  let intervalId;
  const loop = async () => {
    try {
      console.clear();

      const { content, iv } = await cellwanStatus(serverUrl, session);
      const statsDecrypted = dxc(content, aesKey, iv);
      const statsJson = JSON.parse(statsDecrypted);

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
    } catch (error) {
      console.error(error.message);
      clearInterval(intervalId);
      process.exit(1);
    }
  };

  console.log("Waiting for the interval to start...");
  intervalId = setInterval(loop, interval * 1000);
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
  .version(appVersion)
  .option("--no-headless", "disable headless mode")
  .option("-s, --server-url <url>", "server URL", serverUrl)
  .option("-u, --username <username>", "username for login", username)
  .option("-p, --password <password>", "password for login", password)
  .option("-i, --interval <seconds>", "interval in seconds for fetching stats", interval)
  .option("-l, --log", "log stats into a file", false)
  .action((options) => app(options));
program.parse();
