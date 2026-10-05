import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = await verifySessionToken(token);

  // Protect the dashboard pages -- redirect to the login screen if not signed in.
  if (pathname.startsWith("/admin/dashboard")) {
    if (!isAuthed) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Reading, deleting, or exporting CV records is admin-only.
  // Submitting a new CV (POST /api/cvs) stays public.
  const isCvListOrDetail =
    pathname === "/api/cvs" || pathname.startsWith("/api/cvs/");
  const isExport =
    pathname.startsWith("/api/admin/export") ||
    pathname === "/api/admin/change-password";

  if (isExport || (isCvListOrDetail && request.method !== "POST")) {
    if (!isAuthed) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/cvs", "/api/cvs/:path*", "/api/admin/export/:path*", "/api/admin/change-password"],
};
