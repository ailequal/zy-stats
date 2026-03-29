import fs from "fs/promises";

/**
 * Ensures the logs directory exists, creating it recursively if necessary.
 *
 * @param logsDir - Absolute path to the logs directory.
 */
export default async (logsDir: string): Promise<void> => {
  try {
    await fs.access(logsDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(logsDir, { recursive: true });
    } else {
      throw error;
    }
  }
};
