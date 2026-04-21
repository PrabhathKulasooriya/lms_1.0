import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  ShieldCheck,
} from "lucide-react";
import PurchaseButton from "@/app/_components/PurchaseButton";
import Image from "next/image";

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

export default async function CoursePage({ params }) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  // 1. Get cached data
  const allCourses = await getCourses();
  const course = allCourses.find((c) => c.id === courseId);

  if (!course) {
    return <div className="pt-24 text-center">Course not found.</div>;
  }

  // 2. Check Enrollment Status
  const session = await auth();
  const userId = session?.user?.id;

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollments.findFirst({
      where: {
        user_id: parseInt(userId),
        course_id: courseId,
      },
    });
    isEnrolled = !!enrollment;
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT SIDE: Main Content ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Image Placeholder */}
            <div className="relative aspect-video w-full bg-gray-200 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {/* When you add image to DB, use: src={course.image_url} */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col gap-2">
                <BookOpen size={48} className="opacity-20" />
                <p className="text-sm font-medium">Course Preview Image</p>
              </div>
            </div>

            {/* Course Title & Basics */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {course.type === "pastpaper" && (
                  <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                    Past Paper Discussion
                  </span>
                )}
                {course.type === "theory" && (
                  <>
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                      Grade {course.grade}
                    </span>

                    <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                      Theory
                    </span>
                  </>
                )}

                <span className="flex items-center gap-1.5 py-1">
                  <Clock size={16} /> 24/7 Access
                </span>
              </div>
            </div>

            {/* Description Placeholder */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose prose-blue text-gray-600">
                {course.type === "theory" && (
                  <p>
                    {/* course.description from DB goes here */}
                    This is a comprehensive course designed specifically for
                    Grade {course.grade} students. It covers all essential
                    theories and provides practical exercises for {course.grade}{" "}
                    {course.title} subject to ensure thorough understanding.
                  </p>
                )}
                {course.type === "pastpaper" && (
                  <p>
                    {/* course.description from DB goes here */}
                    This is a comprehensive course designed specifically for
                    G.C.E Oridinary Level Examination past paper discussions. 
                    It covers all essential theories and provides practical exercises for students to ensure thorough understanding 
                    of past paper questions and solutions.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE: Purchase Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col gap-6">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Course Price
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">
                    LKR {Number(course.price).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* ── Purchase Button Logic ── */}
                <PurchaseButton
                  courseId={course.id}
                  userId={userId}
                  price={Number(course.price)}
                  title={course.title}
                  isEnrolled={isEnrolled}
                />

                <p className="text-[10px] text-center text-gray-400">
                  Secure Payment Processing via payment gateway. We do not store
                  your payment information.
                </p>
              </div>

              {/* Course Features List */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ShieldCheck className="text-green-600" size={20} />
                  <span>Full course access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Globe className="text-blue-600" size={20} />
                  <span>Access on mobile and web</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
