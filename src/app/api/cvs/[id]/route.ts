import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cv = await prisma.cV.findUnique({ where: { id: params.id } });
  if (!cv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item: cv });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cv = await prisma.cV.findUnique({ where: { id: params.id } });
    if (!cv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Best-effort delete of the stored file; don't fail the request if this errors
    // (e.g. token missing in a local/dev environment).
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(cv.fileUrl);
      }
    } catch (blobErr) {
      console.warn("Could not delete blob for CV", params.id, blobErr);
    }

    await prisma.cV.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete CV", err);
    return NextResponse.json({ error: "Failed to delete CV" }, { status: 500 });
  }
}
