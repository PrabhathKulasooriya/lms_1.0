"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { GraduationCap, BookOpen, FileText } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import PurchaseButton from "@/app/_components/PurchaseButton";

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

const GRADES = [10, 11];

// ─── Course Card ─────────────────────────────────────────────────────────────
function CourseCard({ course, isEnrolled, userId }) {
  const isPastPaper = course.type === "pastpaper";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl ${isPastPaper ? "bg-purple-50" : "bg-blue-50"}`}
        >
          {isPastPaper ? (
            <FileText size={20} className="text-purple-600" />
          ) : (
            <BookOpen size={20} className="text-blue-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-snug">
            {course.title}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {isPastPaper ? "Past Paper" : `Grade ${course.grade}`}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-50" />

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">
          LKR {Number(course.price).toLocaleString()}
        </span>
        <PurchaseButton
          courseId={course.id}
          userId={userId}
          price={Number(course.price)}
          title={course.title}
          isEnrolled={isEnrolled}
        />
      </div>
    </div>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────
function FilterPill({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
      }`}
    >
      {children}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ searchParams }) {
  const { grade, type } = await searchParams;

  const gradeParam = grade ? parseInt(grade) : null;
  // type param: "regular" | "pastpaper" | undefined (show all)
  const typeParam = type ?? null;

  const courses = await getCourses();
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch enrollments for logged-in user
  let enrolledCourseIds = [];
  if (userId) {
    const userEnrollments = await prisma.enrollments.findMany({
      where: { user_id: parseInt(userId) },
      select: { course_id: true },
    });
    enrolledCourseIds = userEnrollments.map((e) => e.course_id);
  }

  // ── Split by type ───────────────────────────────────────────────────────────
  const regularCourses = courses.filter((c) => c.type === "regular");
  const pastPaperCourses = courses.filter((c) => c.type === "pastpaper");

  // ── Apply grade filter to regular courses ───────────────────────────────────
  const gradesToShow = gradeParam ? [gradeParam] : GRADES;
  const coursesByGrade = gradesToShow.reduce((acc, g) => {
    acc[g] = regularCourses.filter((c) => c.grade === g);
    return acc;
  }, {});

  // ── Determine what sections to show ─────────────────────────────────────────
  const showRegular = typeParam === null || typeParam === "regular";
  const showPastPapers = typeParam === null || typeParam === "pastpaper";

  // ── Total count for header badge ─────────────────────────────────────────────
  const regularCount = showRegular
    ? gradesToShow.reduce((sum, g) => sum + (coursesByGrade[g]?.length ?? 0), 0)
    : 0;
  const pastPaperCount = showPastPapers ? pastPaperCourses.length : 0;
  const totalCount = regularCount + pastPaperCount;

  // ── Page title ───────────────────────────────────────────────────────────────
  const pageTitle =
    typeParam === "pastpaper"
      ? "Past Papers"
      : typeParam === "regular" && gradeParam
        ? `Grade ${gradeParam} Courses`
        : typeParam === "regular"
          ? "Regular Courses"
          : gradeParam
            ? `Grade ${gradeParam} Courses`
            : "All Courses";

  return (
    <div className="pt-16 min-h-screen w-full bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <GraduationCap size={26} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              {totalCount}
            </span>
            {(gradeParam || typeParam) && (
              <Link
                href="/courses"
                className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                View all
              </Link>
            )}
          </div>

          {/* ── Filter Pills ── */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type filters */}
            <FilterPill href="/courses" active={!typeParam && !gradeParam}>
              All
            </FilterPill>
            <FilterPill
              href="/courses?type=regular"
              active={typeParam === "regular" && !gradeParam}
            >
              Regular
            </FilterPill>
            <FilterPill
              href="/courses?type=pastpaper"
              active={typeParam === "pastpaper"}
            >
              Past Papers
            </FilterPill>

            {/* Divider */}
            {(typeParam === null || typeParam === "regular") && (
              <>
                <span className="text-gray-200 select-none">|</span>
                {/* Grade filters */}
                {GRADES.map((g) => (
                  <FilterPill
                    key={g}
                    href={`/courses?type=regular&grade=${g}`}
                    active={gradeParam === g && typeParam === "regular"}
                  >
                    Grade {g}
                  </FilterPill>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-12">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <BookOpen size={40} className="opacity-40" />
            <p className="text-lg font-medium">No courses available</p>
          </div>
        ) : (
          <>
            {/* ── Regular Courses (grouped by grade) ── */}
            {showRegular &&
              gradesToShow.map((g) => {
                const gradeCourses = coursesByGrade[g];
                if (!gradeCourses || gradeCourses.length === 0) return null;

                return (
                  <section key={g}>
                    {/* Grade header — hidden when a single grade is filtered */}
                    {!gradeParam && (
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={20} className="text-blue-600" />
                          <h2 className="text-lg font-bold text-gray-900">
                            Grade {g}
                          </h2>
                          <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {gradeCourses.length}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {gradeCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          isEnrolled={enrolledCourseIds.includes(course.id)}
                          userId={userId}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

            {/* ── Past Papers ── */}
            {showPastPapers && pastPaperCourses.length > 0 && (
              <section>
                {/* Section header — hidden when only past papers are shown */}
                {typeParam !== "pastpaper" && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-purple-600" />
                      <h2 className="text-lg font-bold text-gray-900">
                        Past Papers
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                        {pastPaperCourses.length}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pastPaperCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={enrolledCourseIds.includes(course.id)}
                      userId={userId}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
