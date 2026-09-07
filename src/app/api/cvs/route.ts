import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { cvFormSchema } from "@/lib/validation";
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";

export const runtime = "nodejs";

// ---------- POST /api/cvs -- public CV submission ----------
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const raw = {
      fullName: formData.get("fullName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      domain: formData.get("domain")?.toString() ?? "",
      experienceYears: formData.get("experienceYears")?.toString() ?? "",
      currentRole: formData.get("currentRole")?.toString() ?? "",
      currentCompany: formData.get("currentCompany")?.toString() ?? "",
      education: formData.get("education")?.toString() ?? "",
      skills: formData.get("skills")?.toString() ?? "",
      city: formData.get("city")?.toString() ?? "",
    };

    const parsed = cvFormSchema.safeParse(raw);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("cv");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Attach your CV as a PDF or Word document" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 8 MB" },
        { status: 400 }
      );
    }

    if (file.type && !ACCEPTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, or DOCX files are accepted" },
        { status: 400 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "File storage is not configured yet. Set BLOB_READ_WRITE_TOKEN in the environment.",
        },
        { status: 500 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, "").slice(-100);
    const blobPath = `cvs/${Date.now()}-${safeName || "cv.pdf"}`;

    // CVs contain personal details, so they're stored in a private Blob
    // store -- the resulting URL is not fetchable without authentication.
    // The admin dashboard reads files back through /api/cvs/[id]/file.
    const blob = await put(blobPath, file, {
      access: "private",
      addRandomSuffix: true,
    });

    const data = parsed.data;

    const cv = await prisma.cV.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        domain: data.domain,
        experienceYears: data.experienceYears ?? null,
        currentRole: data.currentRole || null,
        currentCompany: data.currentCompany || null,
        education: data.education || null,
        skills: data.skills || null,
        city: data.city || null,
        fileUrl: blob.url,
        filePathname: blob.pathname,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || null,
      },
    });

    return NextResponse.json({ ok: true, id: cv.id }, { status: 201 });
  } catch (err) {
    console.error("CV submission failed", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your CV. Please try again." },
      { status: 500 }
    );
  }
}

// ---------- GET /api/cvs -- admin listing with filters ----------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const domainsParam = searchParams.get("domains"); // comma-separated
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") ?? "25") || 25)
    );
    const sort = searchParams.get("sort") ?? "newest";

    const domains = domainsParam
      ? domainsParam.split(",").map((d) => d.trim()).filter(Boolean)
      : [];

    const where: any = {};

    if (domains.length > 0) {
      where.domain = { in: domains };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { skills: { contains: search, mode: "insensitive" } },
        { currentRole: { contains: search, mode: "insensitive" } },
        { currentCompany: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" as const }
        : sort === "name"
        ? { fullName: "asc" as const }
        : sort === "experience"
        ? { experienceYears: "desc" as const }
        : { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.cV.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.cV.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    console.error("Failed to list CVs", err);
    return NextResponse.json(
      { error: "Failed to load CVs" },
      { status: 500 }
    );
  }
}
