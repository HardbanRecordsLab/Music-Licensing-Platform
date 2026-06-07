import crypto from "crypto";
import { env } from "./env.js";

export interface AudioTokenInput {
  filename: string;
  userId: string;
  expiresAt: string;
}

export function normalizeExpires(expires: string): string | null {
  if (!expires) return null;
  const unix = parseInt(expires, 10);
  if (!Number.isNaN(unix) && unix > 0) {
    return new Date(unix * 1000).toISOString();
  }
  const parsed = new Date(expires);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

export function generateAudioToken({ filename, userId, expiresAt }: AudioTokenInput) {
  const normalized = normalizeExpires(expiresAt);
  if (!normalized) {
    throw new Error("Nieprawidłowy expiresAt dla tokena audio");
  }
  const base = `${userId}:${filename}:${normalized}`;
  return crypto.createHmac("sha256", env.HMAC_SECRET).update(base).digest("hex");
}

export function verifyAudioToken(token: string, filename: string, userId: string, expiresAt: string) {
  const normalized = normalizeExpires(expiresAt);
  if (!normalized) return false;

  const expected = generateAudioToken({ filename, userId, expiresAt: normalized });

  let tokenBuffer: Buffer;
  let expectedBuffer: Buffer;
  try {
    tokenBuffer = Buffer.from(token, "hex");
    expectedBuffer = Buffer.from(expected, "hex");
  } catch {
    return false;
  }

  if (tokenBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
    return false;
  }

  return new Date(normalized) > new Date();
}
