"use server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { GraduationCap, BookOpen } from "lucide-react";

const getCourses = unstable_cache(
  async () => {
    console.log("Fetching courses from database...");
    return await prisma.courses.findMany({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    });
  },
  ["courses-data"],
  {
    tags: ["courses-data"],
    revalidate: 86400,
  },
);

export default async function Page() {
  const courses = await getCourses();

  return (
    <div className="pt-16 min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <GraduationCap size={26} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
          <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            {courses.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <BookOpen size={40} className="opacity-40" />
            <p className="text-lg font-medium">No courses available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
              >
                {/* Icon + Title */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 leading-snug">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Grade {course.grade}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-50" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">
                    LKR {Number(course.price).toLocaleString()}
                  </span>
                  <button className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                    Enroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
