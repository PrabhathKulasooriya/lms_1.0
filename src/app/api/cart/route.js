import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── GET /api/cart ─────────────────────────────────────────────────────────────
// Returns the authenticated user's cart items with course details
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return err("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);

    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            grade: true,
            type: true,
            is_published: true,
          },
        },
      },
      orderBy: { added_at: "asc" },
    });

    // Filter out unpublished courses in case a course was unpublished after being added
    const validItems = cartItems.filter((item) => item.course.is_published);

    // Also check which courses the user is already enrolled in
    const courseIds = validItems.map((i) => i.course_id);
    const enrollments = await prisma.enrollments.findMany({
      where: {
        user_id: userId,
        course_id: { in: courseIds },
        is_active: true,
      },
      select: { course_id: true },
    });
    const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

    const items = validItems.map((item) => ({
      ...item,
      isAlreadyEnrolled: enrolledCourseIds.has(item.course_id),
    }));

    const total = items
      .filter((i) => !i.isAlreadyEnrolled)
      .reduce((sum, i) => sum + Number(i.course.price), 0);

    return ok({ items, total, count: items.length });
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return err("Internal Server Error", 500);
  }
}

// ── POST /api/cart ────────────────────────────────────────────────────────────
// Body: { courseId: number }
// Adds a course to the authenticated user's cart
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return err("You must be logged in to add items to the cart", 401);
    }

    const body = await request.json();
    const courseId = parseInt(body?.courseId);

    if (!courseId || isNaN(courseId)) {
      return err("Valid courseId is required");
    }

    const userId = parseInt(session.user.id);

    // Verify the course exists and is published
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true, is_published: true, title: true },
    });

    if (!course || !course.is_published) {
      return err("Course not found or is not available", 404);
    }

    // Check if the user is already enrolled in this course
    const enrollment = await prisma.enrollments.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } },
    });

    if (enrollment?.is_active) {
      return err("You are already enrolled in this course", 409);
    }

    // Upsert: add to cart (ignore if already exists)
    const cartItem = await prisma.cart_items.upsert({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } },
      create: { user_id: userId, course_id: courseId },
      update: {}, // no-op if already in cart
      include: {
        course: {
          select: { id: true, title: true, price: true, grade: true, type: true },
        },
      },
    });

    return ok({ message: "Course added to cart", cartItem }, 201);
  } catch (error) {
    console.error("[POST /api/cart]", error);
    return err("Internal Server Error", 500);
  }
}

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
// Clears the entire cart for the authenticated user
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return err("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);

    await prisma.cart_items.deleteMany({ where: { user_id: userId } });

    return ok({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("[DELETE /api/cart]", error);
    return err("Internal Server Error", 500);
  }
}
