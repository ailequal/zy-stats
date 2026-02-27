import path from "path";

/**
 * Generates the log file path for today's date.
 * The resulting filename follows the `YYYY-MM-DD.log` format.
 *
 * @param {string} logsDir - Absolute path to the logs directory.
 * @returns {string} The absolute path to today's log file.
 */
export default (logsDir) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return path.join(logsDir, `${year}-${month}-${day}.log`);
};
