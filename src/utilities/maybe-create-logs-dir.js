import fs from "fs/promises";

/**
 * Ensures the logs directory exists, creating it recursively if necessary.
 *
 * @param {string} logsDir - Absolute path to the logs directory.
 * @returns {Promise<void>}
 */
export default async (logsDir) => {
  try {
    await fs.access(logsDir);
  } catch (error) {
    if (error.code === "ENOENT") await fs.mkdir(logsDir, { recursive: true });
    else throw error;
  }
};
