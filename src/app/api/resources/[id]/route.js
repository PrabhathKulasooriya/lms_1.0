import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── PUT /api/resources/[id] ───────────────────────────────────────────────────
// Body: { title?, type?, file_url?, sequence? }
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.resources.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { title, type, file_url, sequence } = body;

    if (type && !["video", "pdf"].includes(type)) {
      return NextResponse.json(
        { message: "type must be 'video' or 'pdf'" },
        { status: 400 },
      );
    }

    const resource = await prisma.resources.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(type !== undefined && { type }),
        ...(file_url !== undefined && { file_url: file_url.trim() }),
        ...(sequence !== undefined && { sequence: parseInt(sequence) }),
      },
    });

    return NextResponse.json(resource);
  } catch (err) {
    console.error("[PUT /api/resources/:id]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/resources/[id] ────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.resources.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 },
      );
    }

    await prisma.resources.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (err) {
    console.error("[DELETE /api/resources/:id]", err);
    return NextResponse.json(
      { message: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// ── GET /api/resources/[id] ─────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const resource = await prisma.resources.findUnique({
      where: { id },
    });

    if (!resource)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(resource);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}