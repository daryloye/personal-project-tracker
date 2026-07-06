import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

export const config = {
  rootDir,
  publicDir: path.join(rootDir, "src", "client"),
  dataDir: process.env.PPT_DATA_DIR || path.join(rootDir, "data"),
  port: Number(process.env.PORT || 3000),
  appSecret: process.env.APP_SECRET || "local-dev-secret-change-me",
  codexCommand: process.env.CODEX_COMMAND || "codex"
};

