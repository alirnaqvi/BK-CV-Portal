import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import {
  ADMIN_SETTINGS_ID,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  verifyAdminPassword,
} from "@/lib/admin-password";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Checked here as well as in middleware, so the route is safe on its own.
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Enter your current password" },
        { status: 400 }
      );
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at most ${MAX_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current one" },
        { status: 400 }
      );
    }

    if (!(await verifyAdminPassword(currentPassword))) {
      // Small delay to make guessing the current password slower.
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.adminSettings.upsert({
      where: { id: ADMIN_SETTINGS_ID },
      update: { passwordHash },
      create: { id: ADMIN_SETTINGS_ID, passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Change password failed", err);
    const code = (err as { code?: string })?.code;
    const error =
      code === "P2021"
        ? "Password storage isn't set up yet. Create the AdminSettings table first (see setup SQL)."
        : "Could not change the password. Please try again.";
    return NextResponse.json({ error }, { status: 500 });
  }
}
