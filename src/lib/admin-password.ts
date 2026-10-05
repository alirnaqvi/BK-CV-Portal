import { prisma } from "@/lib/prisma";
import { safeEqualStrings, verifyPassword } from "@/lib/password";

export const ADMIN_SETTINGS_ID = "admin";
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

async function getStoredHash(): Promise<string | null> {
  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: ADMIN_SETTINGS_ID },
    });
    return row?.passwordHash ?? null;
  } catch (err) {
    // P2021 = the AdminSettings table hasn't been created yet. Until it is,
    // the ADMIN_PASSWORD env var keeps working. Any other database error is
    // rethrown so a DB outage can never silently fall back to an old password.
    if ((err as { code?: string })?.code === "P2021") return null;
    throw err;
  }
}

/** Checks a password against the saved hash, or ADMIN_PASSWORD if none saved. */
export async function verifyAdminPassword(input: string): Promise<boolean> {
  const stored = await getStoredHash();
  if (stored) return verifyPassword(input, stored);

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  return safeEqualStrings(input, envPassword);
}
