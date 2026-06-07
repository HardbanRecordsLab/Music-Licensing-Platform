import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { UserRecord } from "./users.js";

export function generateToken(user: UserRecord) {
  return jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: "12h"
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}
