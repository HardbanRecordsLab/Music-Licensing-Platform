import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const required = ["HMAC_SECRET", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("[FATAL] Brakuje wymaganych zmiennych środowiskowych:", missing.join(", "));
  process.exit(1);
}

export const env = {
  HMAC_SECRET: process.env.HMAC_SECRET as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "9108", 10),
  APP_ORIGIN: process.env.APP_ORIGIN || "",
  VITE_API_URL: process.env.VITE_API_URL || "",
  TOKEN_TTL_SECONDS: parseInt(process.env.TOKEN_TTL_SECONDS || "7200", 10)
};
