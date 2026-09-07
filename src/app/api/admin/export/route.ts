import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CSV_COLUMNS: { key: string; label: string }[] = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "domain", label: "Domain" },
  { key: "experienceYears", label: "Experience (yrs)" },
  { key: "currentRole", label: "Current Role" },
  { key: "currentCompany", label: "Current Company" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "city", label: "City" },
  { key: "fileName", label: "CV File" },
  { key: "fileUrl", label: "CV Link" },
  { key: "createdAt", label: "Submitted On" },
];

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(rows: Record<string, unknown>[]): string {
  const header = CSV_COLUMNS.map((c) => escapeCsvValue(c.label)).join(",");
  const lines = rows.map((row) =>
    CSV_COLUMNS.map((c) => escapeCsvValue((row as any)[c.key])).join(",")
  );
  return [header, ...lines].join("\n");
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_").slice(0, 120) || "cv";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const format: string = body?.format === "csv" ? "csv" : "zip";

    if (ids.length === 0) {
      return NextResponse.json({ error: "No CVs selected" }, { status: 400 });
    }

    const cvs = await prisma.cV.findMany({ where: { id: { in: ids } } });

    if (cvs.length === 0) {
      return NextResponse.json({ error: "No matching CVs found" }, { status: 404 });
    }

    if (format === "csv") {
      const csv = buildCsv(cvs as unknown as Record<string, unknown>[]);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bk-cv-export-${Date.now()}.csv"`,
        },
      });
    }

    // ZIP export: fetch each CV file and bundle it with a CSV manifest.
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    const archiveDone = new Promise<void>((resolve, reject) => {
      archive.on("end", () => resolve());
      archive.on("error", (err: Error) => reject(err));
    });

    const usedNames = new Set<string>();

    for (const cv of cvs) {
      try {
        if (!cv.filePathname) continue;

        // Files live in a private Blob store, so they're read back with the
        // SDK's get() (authenticated), not a plain fetch() of the stored URL.
        const result = await get(cv.filePathname, { access: "private" });
        if (!result || result.statusCode !== 200 || !result.stream) continue;

        const arrayBuffer = await new Response(
          result.stream as unknown as ReadableStream
        ).arrayBuffer();

        let name = sanitizeFileName(`${cv.fullName} - ${cv.fileName}`);
        let finalName = name;
        let counter = 1;
        while (usedNames.has(finalName)) {
          finalName = `${name.replace(/(\.[^.]+)?$/, "")}-${counter}${
            name.match(/(\.[^.]+)?$/)?.[0] ?? ""
          }`;
          counter += 1;
        }
        usedNames.add(finalName);

        archive.append(Buffer.from(arrayBuffer), { name: finalName });
      } catch (fileErr) {
        console.warn("Skipping file for CV", cv.id, fileErr);
      }
    }

    const manifest = buildCsv(cvs as unknown as Record<string, unknown>[]);
    archive.append(manifest, { name: "manifest.csv" });

    archive.finalize();
    await archiveDone;

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="bk-cv-export-${Date.now()}.zip"`,
      },
    });
  } catch (err) {
    console.error("Export failed", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
