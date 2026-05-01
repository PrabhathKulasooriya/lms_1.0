import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── GET  /api/enrollment ──────────────────────────────────────────────────────
// Query params:
//   page     (default 1)
//   limit    (default 20)
//   search   (matches user name / email / course title)
//   status   "active" | "inactive" | "expired" | "all" (default "all")
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
    );
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "all"; // "active" | "inactive" | "expired" | "all"
    const skip = (page - 1) * limit;

    const now = new Date();

    // ── Build where clause ───────────────────────────────────────────────────
    const where = {
      // Search: match user first/last name, email, or course title
      ...(search && {
        OR: [
          { user: { first_name: { contains: search, mode: "insensitive" } } },
          { user: { last_name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { course: { title: { contains: search, mode: "insensitive" } } },
        ],
      }),

      // Status filter
      ...(status === "active" && {
        is_active: true,
        OR: [{ expires_at: null }, { expires_at: { gt: now } }],
      }),
      ...(status === "inactive" && { is_active: false }),
      ...(status === "expired" && { expires_at: { lte: now } }),
    };

    // ── Run count + paginated query in parallel ───────────────────────────────
    const [total, enrollments] = await Promise.all([
      prisma.enrollments.count({ where }),
      prisma.enrollments.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolled_at: "desc" },
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
          course: {
            select: {
              id: true,
              title: true,
              grade: true,
              type: true,
            },
          },
        },
      }),
    ]);

    return ok({
      enrollments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/enrollment]", error);
    return err("Internal Server Error", 500);
  }
}

// ── POST  /api/enrollment ─────────────────────────────────────────────────────
// Body: { userId, courseId, expires_at? }
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, courseId, expires_at } = body;

    if (!userId || !courseId) {
      return err("userId and courseId are required");
    }

    const userIdInt = parseInt(userId);
    const courseIdInt = parseInt(courseId);

    if (isNaN(userIdInt) || isNaN(courseIdInt)) {
      return err("userId and courseId must be valid integers");
    }

    // ── Verify user & course exist ────────────────────────────────────────────
    const [user, course] = await Promise.all([
      prisma.users.findUnique({
        where: { id: userIdInt },
        select: { id: true },
      }),
      prisma.courses.findUnique({
        where: { id: courseIdInt },
        select: { id: true },
      }),
    ]);

    if (!user) return err("User not found", 404);
    if (!course) return err("Course not found", 404);

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existing = await prisma.enrollments.findUnique({
      where: {
        user_id_course_id: { user_id: userIdInt, course_id: courseIdInt },
      },
    });

    if (existing) return err("User is already enrolled in this course");

    // ── Create ────────────────────────────────────────────────────────────────
    const enrollment = await prisma.enrollments.create({
      data: {
        user_id: userIdInt,
        course_id: courseIdInt,
        expires_at: expires_at ? new Date(expires_at) : null,
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
        course: { select: { id: true, title: true, grade: true, type: true } },
      },
    });

    return ok({ message: "Enrollment created successfully", enrollment }, 201);
  } catch (error) {
    console.error("[POST /api/enrollment]", error);
    return err("Internal Server Error", 500);
  }
}
