import path from "path";

export default (logsDir) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return path.join(logsDir, `${year}-${month}-${day}.log`);
};
