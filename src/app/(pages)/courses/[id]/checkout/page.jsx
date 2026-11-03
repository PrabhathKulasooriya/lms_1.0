import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LegacyCourseCheckoutPage({ params }) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/cart`);
  }

  const userId = parseInt(session.user.id);

  if (courseId && !isNaN(courseId)) {
    // Check enrollment
    const enrollment = await prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        is_active: true,
      },
    });

    if (enrollment) {
      redirect(`/learnings/${courseId}`);
    }

    // Ensure it's in the cart
    try {
      await prisma.cart_items.upsert({
        where: { user_id_course_id: { user_id: userId, course_id: courseId } },
        create: { user_id: userId, course_id: courseId },
        update: {},
      });
    } catch (err) {
      console.error("[LegacyCourseCheckoutPage] auto add to cart error:", err);
    }
  }

  redirect("/cart");
}
