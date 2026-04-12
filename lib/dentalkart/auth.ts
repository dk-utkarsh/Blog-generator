import { db } from "../db/client";
import { dentalkartAuth } from "../db/schema";
import { desc, gt } from "drizzle-orm";

const DENTALKART_URL = process.env.DENTALKART_BLOG_URL || "https://www.dentalkart.com/blogs";
const EMAIL = process.env.DENTALKART_ADMIN_EMAIL || "";
const PASSWORD = process.env.DENTALKART_ADMIN_PASSWORD || "";

/**
 * Get a valid DentalKart auth token.
 * Returns a cached token if still valid (with 1 hour buffer).
 * Otherwise, logs in fresh and saves the new token.
 */
export async function getDentalkartToken(): Promise<string> {
  // Check for cached token that's valid for at least 1 more hour
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

  const cached = await db
    .select()
    .from(dentalkartAuth)
    .where(gt(dentalkartAuth.expiresAt, oneHourFromNow))
    .orderBy(desc(dentalkartAuth.createdAt))
    .limit(1);

  if (cached.length > 0) {
    return cached[0].token;
  }

  // No valid cached token — login fresh
  return await loginAndSave();
}

async function loginAndSave(): Promise<string> {
  if (!EMAIL || !PASSWORD) {
    throw new Error("DENTALKART_ADMIN_EMAIL and DENTALKART_ADMIN_PASSWORD must be set in .env");
  }

  const response = await fetch(`${DENTALKART_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DentalKart login failed: ${response.status} ${text}`);
  }

  // Extract auth-token from Set-Cookie header
  const setCookie = response.headers.get("set-cookie") || "";
  const match = setCookie.match(/auth-token=([^;]+)/);
  if (!match) {
    throw new Error("No auth-token cookie in login response");
  }
  const token = match[1];

  // Parse JWT expiry from payload
  const expiresAt = getJwtExpiry(token);

  // Save to DB
  await db.insert(dentalkartAuth).values({
    token,
    expiresAt,
  });

  return token;
}

function getJwtExpiry(token: string): Date {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );
    return new Date(payload.exp * 1000);
  } catch {
    // Fallback: 6 days (token is valid 7 days, buffer 1 day)
    return new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  }
}
