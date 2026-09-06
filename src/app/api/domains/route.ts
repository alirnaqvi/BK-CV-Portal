import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SUGGESTED_DOMAINS } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.cV.findMany({
      distinct: ["domain"],
      select: { domain: true },
      orderBy: { domain: "asc" },
    });

    const existing = rows.map((r) => r.domain).filter(Boolean).sort();

    return NextResponse.json({
      suggested: SUGGESTED_DOMAINS,
      existing,
    });
  } catch (err) {
    console.error("Failed to load domains", err);
    // Degrade gracefully -- the upload form can still work with the suggested list.
    return NextResponse.json({ suggested: SUGGESTED_DOMAINS, existing: [] });
  }
}
