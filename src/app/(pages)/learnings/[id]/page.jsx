import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Lock } from "lucide-react";

import PurchaseSuccessToast from "@/app/_components/PurchaseSuccessToast";
import CourseViewer from "@/app/(pages)/learnings/[id]/CourseViewer";

// Fetch a single course with all its lessons and resources nested
const getCourseData = unstable_cache(
  async (courseId) => {
    return await prisma.courses.findUnique({
      where: {
        id: courseId,
        is_published: true,
      },
      include: {
        lessons: {
          orderBy: { sequence: "asc" },
          include: {
            resources: {
              orderBy: { sequence: "asc" },
            },
          },
        },
      },
    });
  },
  ["course-details"], // Cache key
  { tags: ["courses-data"], revalidate: 1 },
);

export default async function LearningPage({ params, searchParams }) {
  const { id } = await params;
  const courseId = parseInt(id, 10);
  const { purchase } = await searchParams;

  // 1. Fetch course data dynamically
  const course = await getCourseData(courseId);

  if (!course) {
    return (
      <div className="pt-24 text-center text-gray-500">Course not found.</div>
    );
  }

  // ── Enrollment check ────────────────────────────────────────────────────
  const session = await auth();
  const userId = session?.user?.id;

  let enrollment = null;
  if (userId) {
    const isFreshPurchase = purchase === "success";
    const attempts = isFreshPurchase ? 5 : 1;
    const delayMs = 2000;

    for (let i = 0; i < attempts; i++) {
      enrollment = await prisma.enrollments.findUnique({
        where: {
          user_id_course_id: {
            user_id: parseInt(userId),
            course_id: courseId,
          },
        },
      });

      if (enrollment) break;

      if (i < attempts - 1) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  // Helper to render the restriction UI
  const AccessRestricted = ({
    title,
    message,
    buttonText = "Browse Courses",
  }) => (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <Lock size={26} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {message}{" "}
          {course.grade && (
            <span className="font-semibold text-gray-700">
              Grade {course.grade}{" "}
            </span>
          )}
          <span className="font-semibold text-gray-700">{course.title}</span>.
        </p>

        {buttonText === "contact" ? (
          <Link
            href="/contact"
            className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Contact Support
          </Link>
        ) : (
          <Link
            href={`/courses/${course.id}`}
            className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Enroll Now
          </Link>
        )}
      </div>
    </div>
  );

  // 1. Check if enrollment exists at all
  if (!enrollment) {
    return (
      <AccessRestricted message="You are not enrolled in" buttonText="enroll" />
    );
  }

  // 2. Check if the existing enrollment is active
  if (enrollment.is_active === false) {
    return (
      <AccessRestricted
        message="Your access has expired or is currently inactive for"
        buttonText="contact"
      />
    );
  }

  // 3. ── Enrolled view ──────────────────────────────────────────────────────
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <PurchaseSuccessToast />

      {/* Pass the fully populated course object to the Client Component 
        which will handle state for the active video/pdf and the accordion 
      */}
      <CourseViewer course={course} />
    </div>
  );
}
