import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── DELETE /api/cart/[courseId] ───────────────────────────────────────────────
// Removes a single course from the authenticated user's cart
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return err("Unauthorized", 401);
    }

    const { courseId } = await params;
    const courseIdInt = parseInt(courseId);

    if (!courseIdInt || isNaN(courseIdInt)) {
      return err("Valid courseId is required");
    }

    const userId = parseInt(session.user.id);

    await prisma.cart_items.deleteMany({
      where: { user_id: userId, course_id: courseIdInt },
    });

    return ok({ message: "Item removed from cart" });
  } catch (error) {
    console.error("[DELETE /api/cart/[courseId]]", error);
    return err("Internal Server Error", 500);
  }
}
