"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { GraduationCap, BookOpen } from "lucide-react";
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

function CourseCard({ course, isEnrolled, userId }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-snug">
            {course.title}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">Grade {course.grade}</p>
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

export default async function Page({ searchParams }) {

  const {grade} = await searchParams;
  const gradeParam = grade ? parseInt(grade) : null;

  const courses = await getCourses();
  const session = await auth();
  const userId = session?.user?.id;

  let enrolledCourseIds = [];
  if (userId) {
    const userEnrollments = await prisma.enrollments.findMany({
      where: { user_id: parseInt(userId) },
      select: { course_id: true },
    });
    enrolledCourseIds = userEnrollments.map((e) => e.course_id);
  }

  // If a grade param exists, only show that grade's section, otherwise show all
  const gradesToShow = gradeParam ? [gradeParam] : GRADES;

  const coursesByGrade = gradesToShow.reduce((acc, grade) => {
    acc[grade] = courses.filter((c) => c.grade === grade);
    return acc;
  }, {});

  // Count only the courses being shown, not all courses
  const totalCount = gradesToShow.reduce(
    (sum, grade) => sum + (coursesByGrade[grade]?.length ?? 0),
    0,
  );

  return (
    <div className="pt-16 min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <GraduationCap size={26} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {gradeParam ? `Grade ${gradeParam} Courses` : "All Courses"}
          </h1>
          <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            {totalCount}
          </span>
          {/* Show "View all" only when filtered */}
          {gradeParam && (
            <Link
              href="/courses"
              className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              View all
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-12">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <BookOpen size={40} className="opacity-40" />
            <p className="text-lg font-medium">No courses available yet</p>
          </div>
        ) : (
          gradesToShow.map((grade) => {
            const gradeCourses = coursesByGrade[grade];

            // Skip section if no courses exist for this grade
            if (!gradeCourses || gradeCourses.length === 0) return null;

            return (
              <section key={grade}>
                {/* Grade Section Header — hidden when only one grade is shown */}
                {!gradeParam && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={20} className="text-blue-600" />
                      <h2 className="text-lg font-bold text-gray-900">
                        Grade {grade}
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {gradeCourses.length}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                {/* Courses Grid */}
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
          })
        )}
      </div>
    </div>
  );
}
