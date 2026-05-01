import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

// ── GET /api/lessons/[id] ─────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const lesson = await prisma.lessons.findUnique({
      where: { id },
      include: { resources: { orderBy: { sequence: "asc" } } },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(lesson);
  } catch (err) {
    console.error("[GET /api/lessons/:id]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// ── PUT /api/lessons/[id] ─────────────────────────────────────────────────────
// Body: { title?, sequence?, resources?: [{ id?, title, type, file_url, sequence }] }
// When `resources` is included, all existing resources are replaced.
export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params; // CORRECT
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.lessons.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { title, sequence, resources } = body;

    // Validate resources if provided
    if (Array.isArray(resources)) {
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
    }

    // Update lesson fields
    await prisma.lessons.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(sequence !== undefined && {
          sequence: parseInt(sequence) || existing.sequence,
        }),
      },
    });

    // Replace resources atomically
    if (Array.isArray(resources)) {
      await prisma.$transaction([
        // Delete all current resources for this lesson
        prisma.resources.deleteMany({ where: { lesson_id: id } }),
        // Re-create from submitted list
        ...(resources.length > 0
          ? [
              prisma.resources.createMany({
                data: resources.map((r, i) => ({
                  course_id: existing.course_id,
                  lesson_id: id,
                  title: r.title.trim(),
                  type: r.type,
                  file_url: r.file_url.trim(),
                  sequence: r.sequence ?? i,
                })),
              }),
            ]
          : []),
      ]);
    }

    // Return updated lesson with fresh resource list
    const updated = await prisma.lessons.findUnique({
      where: { id },
      include: { resources: { orderBy: { sequence: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/lessons/:id]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/lessons/[id] ──────────────────────────────────────────────────
// Cascades to resources via Prisma schema (onDelete: Cascade)
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const lesson = await prisma.lessons.findUnique({ where: { id } });
    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 404 },
      );
    }

    await prisma.lessons.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    console.error("[DELETE /api/lessons/:id]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
