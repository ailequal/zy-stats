import fs from "fs/promises";

export const maybeCreateLogsDir = async (logsDir) => {
  try {
    await fs.access(logsDir);
  } catch (error) {
    if (error.code === "ENOENT") await fs.mkdir(logsDir, { recursive: true });
    else throw error;
  }
};
