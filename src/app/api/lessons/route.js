import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // adjust to your prisma client path

// ── GET /api/lessons?course_id=X&page=1&limit=20&search=… ────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const course_id = searchParams.get("course_id");
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));

    if (!course_id) {
      return NextResponse.json(
        { message: "course_id query parameter is required" },
        { status: 400 },
      );
    }

    const where = {
      course_id: parseInt(course_id),
      ...(search && {
        title: { contains: search, mode: "insensitive" },
      }),
    };

    const [lessons, total] = await Promise.all([
      prisma.lessons.findMany({
        where,
        orderBy: { sequence: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          resources: { orderBy: { sequence: "asc" } },
        },
      }),
      prisma.lessons.count({ where }),
    ]);

    return NextResponse.json({ lessons, total, page, limit });
  } catch (err) {
    console.error("[GET /api/lessons]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// ── POST /api/lessons ─────────────────────────────────────────────────────────
// Body: { course_id, title, sequence, resources: [{ title, type, file_url }] }
export async function POST(request) {
  try {
    const body = await request.json();
    const { course_id, title, sequence, resources = [] } = body;

    if (!course_id) {
      return NextResponse.json(
        { message: "course_id is required" },
        { status: 400 },
      );
    }
    if (!title?.trim()) {
      return NextResponse.json(
        { message: "title is required" },
        { status: 400 },
      );
    }

    // Validate each resource
    for (const [i, r] of resources.entries()) {
      if (!r.title?.trim()) {
        return NextResponse.json(
          { message: `Resource #${i + 1} is missing a title` },
          { status: 400 },
        );
      }
      if (!r.file_url?.trim()) {
        return NextResponse.json(
          { message: `Resource #${i + 1} is missing a URL` },
          { status: 400 },
        );
      }
      if (!["video", "pdf"].includes(r.type)) {
        return NextResponse.json(
          { message: `Resource #${i + 1} has an invalid type` },
          { status: 400 },
        );
      }
    }

    const lesson = await prisma.lessons.create({
      data: {
        course_id: parseInt(course_id),
        title: title.trim(),
        sequence: parseInt(sequence) || 1,
        resources: {
          create: resources.map((r, i) => ({
            course_id: parseInt(course_id),
            title: r.title.trim(),
            type: r.type,
            file_url: r.file_url.trim(),
            sequence: r.sequence ?? i,
          })),
        },
      },
      include: { resources: { orderBy: { sequence: "asc" } } },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (err) {
    console.error("[POST /api/lessons]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

