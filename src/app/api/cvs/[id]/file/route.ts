import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Streams a single CV file for viewing/downloading in the admin dashboard.
// Protected by src/middleware.ts (same rule as the other /api/cvs/:path* routes).
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cv = await prisma.cV.findUnique({ where: { id: params.id } });
    if (!cv || !cv.filePathname) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const result = await get(cv.filePathname, { access: "private" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const forceDownload = request.nextUrl.searchParams.get("download") === "1";
    const safeFileName = cv.fileName.replace(/"/g, "'");

    return new NextResponse(result.stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || cv.fileType || "application/octet-stream",
        "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${safeFileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Failed to stream CV file", err);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
