import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── GET  /api/enrollment/[id] ─────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return err("Invalid ID");

    const enrollment = await prisma.enrollments.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            mobile: true,
          },
        },
        course: { select: { id: true, title: true, type: true, grade: true } },
      },
    });

    if (!enrollment) return err("Enrollment not found", 404);
    return ok({ enrollment });
  } catch (error) {
    console.error("[GET /api/enrollment/[id]]", error);
    return err("Internal Server Error", 500);
  }
}

// ── PUT  /api/enrollment/[id] ─────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return err("Invalid ID");

    const existing = await prisma.enrollments.findUnique({ where: { id } });
    if (!existing) return err("Enrollment not found", 404);

    const body = await request.json();
    const { is_active, expires_at } = body;

    const data = {};
    if (is_active !== undefined) data.is_active = Boolean(is_active);
    if (expires_at !== undefined)
      data.expires_at = expires_at ? new Date(expires_at) : null;

    if (Object.keys(data).length === 0)
      return err("No updatable fields provided");

    const enrollment = await prisma.enrollments.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
        course: { select: { id: true, title: true, type: true, grade: true } },
      },
    });

    return ok({ message: "Enrollment updated successfully", enrollment });
  } catch (error) {
    console.error("[PUT /api/enrollment/[id]]", error);
    return err("Internal Server Error", 500);
  }
}

// ── DELETE  /api/enrollment/[id] ──────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return err("Invalid ID");

    const existing = await prisma.enrollments.findUnique({ where: { id } });
    if (!existing) return err("Enrollment not found", 404);

    await prisma.enrollments.delete({ where: { id } });
    return ok({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/enrollment/[id]]", error);
    return err("Internal Server Error", 500);
  }
}
