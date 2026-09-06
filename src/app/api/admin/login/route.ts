import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin login is not configured. Set ADMIN_PASSWORD." },
        { status: 500 }
      );
    }

    if (typeof password !== "string" || password !== adminPassword) {
      // Small delay to make brute-forcing marginally slower.
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (err) {
    console.error("Login failed", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
