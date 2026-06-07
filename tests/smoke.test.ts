import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:9108";

describe("backend smoke tests", () => {
  it("should return health status", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok" });
  });

  it("should authenticate with admin demo user", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@hrl.pl", password: "adminpass" }),
    });
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty("token");
    expect(body).toHaveProperty("user");
    expect(body.user.email).toBe("admin@hrl.pl");
  });
});
