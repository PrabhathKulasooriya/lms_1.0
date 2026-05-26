import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { Clock, Globe, ShieldCheck, Eye, ArrowLeft, Zap } from "lucide-react";
import PurchaseButton from "@/app/_components/PurchaseButton";

import grade10 from "@/assets/course-images/grade10.png";
import grade11 from "@/assets/course-images/grade11.png";
import pp from "@/assets/course-images/pp.png";

// ─── Static fallback images ────────────────────────────────────────────────────
const STATIC_IMAGES = {
  "theory-10": grade10,
  "theory-11": grade11,
  pastpaper: pp,
};

function getCourseImage(course) {
  if (course.image_url) return course.image_url;
  if (course.type === "pastpaper") return STATIC_IMAGES["pastpaper"];
  return (
    STATIC_IMAGES[`theory-${course.grade}`] ?? "/course-images/default.jpg"
  );
}

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

  const allCourses = await getCourses();
  const course = allCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Course not found.</p>
      </div>
    );
  }

  const session = await auth();
  const userId = session?.user?.id;

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollments.findFirst({
      where: { user_id: parseInt(userId), course_id: parseInt(courseId) },
    });
    isEnrolled = !!enrollment;
  }

  const imageUrl = getCourseImage(course);
  const isPastPaper = course.type === "pastpaper";

  return (
    <div className="pt-20 min-h-screen bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Back */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 mb-6 text-xs text-gray-400 hover:text-[#0b408e] transition-colors font-medium"
        >
          <ArrowLeft size={13} />
          All Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── LEFT ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Hero card */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm group">
              {/* Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={imageUrl}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b408e] via-[#0b408e]/30 to-transparent opacity-70" />

                {/* Overlay — label light, title is the hero */}
                <div className="absolute bottom-0 left-0 w-full md:px-7 md:pb-7 px-4 pb-4 pt-12">
                  <h1 className="text-white text-3xl font-bold leading-tight mb-3">
                    {course.title}
                  </h1>
                  <p className="text-[#9fe03c] text-[10px] font-semibold uppercase tracking-[0.22em] mb-2">
                    {isPastPaper
                      ? "Past Paper"
                      : `Grade ${course.grade} · Theory`}
                  </p>
                  {/* Gold bar */}
                  <div className="w-50 h-0.5 rounded-full bg-[#FFD700]" />
                </div>
              </div>

              {/* White content */}
              <div className="px-7 py-6 flex flex-col gap-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.type === "theory" && (
                    <>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#0b408e]/6 text-[#0b408e] border border-[#0b408e]/10">
                        Grade {course.grade}
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#9fe03c]/12 text-[#4a7a1e] border border-[#9fe03c]/25">
                        Theory
                      </span>
                    </>
                  )}
                  {course.type === "pastpaper" && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#0b408e]/6 text-[#0b408e] border border-[#0b408e]/10">
                      Past Paper
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                    <Clock size={11} /> 24/7 Access
                  </span>
                </div>

                {/* Description 👈 Updated to fetch dynamic description */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 rounded-full bg-[#9fe03c]" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      About this course
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-3 whitespace-pre-wrap">
                    {course.description ||
                      (course.type === "theory"
                        ? `A structured Grade ${course.grade} programme covering the full syllabus with theory lessons and practical exercises for ${course.title}.`
                        : "Comprehensive G.C.E O/L past paper discussions with model answers and exam techniques to maximise your score.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Top accent */}
              <div className="h-1 bg-[#9fe03c]" />

              <div className="p-6 flex flex-col gap-6">
                {/* Price */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Course Price
                  </p>
                  <p className="text-3xl font-bold text-[#0b408e]">
                    LKR {Number(course.price).toLocaleString()}
                  </p>
                  <div className="w-8 h-0.5 rounded-full bg-[#FFD700] mt-2" />
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-2.5">
                  <PurchaseButton
                    courseId={course.id}
                    userId={userId}
                    price={Number(course.price)}
                    title={course.title}
                    isEnrolled={isEnrolled}
                  />
                  {isEnrolled && (
                    <Link
                      href={`/learnings/${course.id}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium text-[#0b408e] border border-[#0b408e]/20 hover:border-[#0b408e]/50 hover:bg-[#0b408e]/3 transition-all"
                    >
                      <Eye size={14} />
                      View Course
                    </Link>
                  )}
                  <p className="text-[10px] text-center text-gray-400 leading-relaxed">
                    Secure payment processing. We do not store your payment
                    information.
                  </p>
                </div>

                {/* Features */}
                <div className="pt-5 border-t border-gray-100 flex flex-col gap-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    What's included
                  </p>
                  {[
                    { icon: ShieldCheck, label: "Full course access" },
                    { icon: Globe, label: "Mobile & web access" },
                    { icon: Zap, label: "Instant enrollment" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <Icon size={14} className="text-[#0b408e] shrink-0" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
