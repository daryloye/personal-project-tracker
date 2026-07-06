import crypto from "node:crypto";

const algorithm = "aes-256-gcm";

export function encryptSecret(secret, appSecret) {
  if (!secret) return "";
  const key = deriveKey(appSecret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(payload, appSecret) {
  if (!payload) return "";
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const key = deriveKey(appSecret);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function deriveKey(appSecret) {
  return crypto.createHash("sha256").update(appSecret).digest();
}

