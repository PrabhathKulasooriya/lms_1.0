import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import CheckoutClient from "@/app/_components/CheckoutClient";

const getCourses = unstable_cache(
  async () => {
    return await prisma.courses.findMany({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    });
  },
  ["courses-data"],
  { tags: ["courses-data"], revalidate: 86400 },
);

export default async function CheckoutPage({ params }) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  // ── Auth guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/courses/${courseId}/checkout`);
  }

  // ── Load course ────────────────────────────────────────────────────────────
  const allCourses = await getCourses();
  const course = allCourses.find((c) => c.id === courseId);

  if (!course) {
    redirect("/courses");
  }

  // ── Already enrolled? Send straight to learning ───────────────────────────
  const enrollment = await prisma.enrollments.findFirst({
    where: {
      user_id: parseInt(session.user.id),
      course_id: courseId,
      is_active: true,
    },
  });

  if (enrollment) {
    redirect(`/learnings/${courseId}`);
  }

  return <CheckoutClient course={course} courseId={courseId} />;
}
