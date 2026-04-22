import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Tag,
  Hash,
  Lock,
} from "lucide-react";

import LessonAccordion from "@/app/_components/LessonAccordion"; 
import PurchaseSuccessToast from "@/app/_components/PurchaseSuccessToast";

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

export default async function learningPage({ params, searchParams }) {
  
  const { id } = await params;
  const courseId = parseInt(id, 10);
  const { purchase } = await searchParams;

  const allCourses = await getCourses();
  const course = allCourses.find((c) => c.id === courseId);

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
      enrollment = await prisma.enrollments.findFirst({
        where: {
          user_id: parseInt(userId),
          course_id: courseId,
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
          </span>)}
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
      <AccessRestricted
        message="You are not enrolled in"
        buttonText="enroll"
      />
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

  //3. ── Enrolled view ────────────────────────────────────────────────────────
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
        {/* Purchase Success Toast */}
        <PurchaseSuccessToast />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* ── Course Header Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              {/* Type badge */}
              <span
                className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  course.type === "pastpaper"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {course.type === "pastpaper" ? "Past Paper" : "Theory"}
              </span>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900">
                {course.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mt-1">
                {course.grade && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Hash size={14} className="text-gray-400" />
                    <span>Grade {course.grade}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Tag size={14} className="text-gray-400" />
                  <span>LKR {Number(course.price).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <BookOpen size={14} className="text-gray-400" />
                  <span>5 Lessons</span>
                </div>
              </div>
            </div>

            {/* Enrolled badge */}
            <div className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
              <ShieldCheck size={15} className="text-green-600" />
              <span className="text-xs font-semibold text-green-700">
                Enrolled
              </span>
            </div>
          </div>
        </div>

        {/* ── Lessons Section ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={20} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Course Lessons
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              5
            </span>
          </div>
          <LessonAccordion />
        </div>
      </div>
    </div>
  );
}