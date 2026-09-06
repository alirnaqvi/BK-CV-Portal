import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "bk_admin_session";
const SESSION_DURATION = "12h";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed JWT that proves the holder authenticated as the admin (BK).
 * Stored client-side as an httpOnly cookie.
 */
export async function createSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

/**
 * Verifies a session token. Returns true if it is a valid, unexpired admin session.
 * Safe to call from middleware (edge runtime) since it only uses jose + Web Crypto.
 */
export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
