"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { GraduationCap, BookOpen, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

const GRADES = [10, 11];

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course }) {
  const isPastPaper = course.type === "pastpaper";
  const imageUrl = getCourseImage(course);

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#0b408e]/8 transition-all duration-300 hover:-translate-y-1">
        {/* Image + gradient overlay */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <Image
            src={imageUrl}
            alt={course.title}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b408e] via-[#0b408e]/30 to-transparent opacity-70" />

          {/* Overlay text — only the label is tracked/uppercase; title is normal weight */}
          <div className="absolute bottom-0 left-0 w-full px-2  pt-8">
            <h3 className="text-white text-lg font-bold leading-snug">
              {course.title}
            </h3>
            <p className="text-[#9fe03c] text-[10px] font-semibold uppercase tracking-[0.22em] mb-1.5">
              {isPastPaper ? "Past Paper" : `Grade ${course.grade} · Theory`}
            </p>
          </div>
        </div>

        {/* Card footer */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-50">
          {/* Left Half: Price */}
          <div className="px-5 py-4 flex flex-col justify-center">
            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
              Price
            </p>
            <p className="text-[#0b408e] font-bold text-base truncate">
              LKR {Number(course.price).toLocaleString()}
            </p>
          </div>

          {/* Right Half: Action Button */}
          <div className="px-5 py-4 flex items-center justify-center">
            <button className="w-full py-2 bg-[#0b408e] hover:bg-[#082f6b] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────
function FilterPill({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-[#0b408e] text-white shadow-md shadow-[#0b408e]/20"
          : "bg-white text-gray-500 border border-gray-200 hover:border-[#0b408e]/30 hover:text-[#0b408e]"
      }`}
    >
      {children}
    </Link>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ label, count }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-1 h-5 rounded-full bg-[#9fe03c]" />
      <h2 className="text-sm font-semibold text-[#0b408e] tracking-wide">
        {label}
      </h2>
      <span className="text-xs font-bold text-[#9fe03c] bg-[#0b408e] px-2 py-0.5 rounded-full leading-none">
        {count}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ searchParams }) {
  const { grade, type } = await searchParams;

  const gradeParam = grade ? parseInt(grade) : null;
  const typeParam = type ?? null;

  const courses = await getCourses();

  const theoryCourses = courses.filter((c) => c.type === "theory");
  const pastPaperCourses = courses.filter((c) => c.type === "pastpaper");

  const gradesToShow = gradeParam ? [gradeParam] : GRADES;
  const coursesByGrade = gradesToShow.reduce((acc, g) => {
    acc[g] = theoryCourses.filter((c) => c.grade === g);
    return acc;
  }, {});

  const showTheory = typeParam === null || typeParam === "theory";
  const showPastPapers = typeParam === null || typeParam === "pastpaper";

  const theoryCount = showTheory
    ? gradesToShow.reduce((sum, g) => sum + (coursesByGrade[g]?.length ?? 0), 0)
    : 0;
  const pastPaperCount = showPastPapers ? pastPaperCourses.length : 0;
  const totalCount = theoryCount + pastPaperCount;

  const pageTitle =
    typeParam === "pastpaper"
      ? "Past Papers"
      : typeParam === "theory" && gradeParam
        ? `Grade ${gradeParam} Courses`
        : typeParam === "theory"
          ? "Theory Courses"
          : gradeParam
            ? `Grade ${gradeParam} Courses`
            : "All Courses";

  return (
    <div className="pt-16 min-h-screen w-full bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {/* Title row */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#0b408e]/6 border border-[#0b408e]/10">
              <GraduationCap size={20} className="text-[#0b408e]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <span className="text-[11px] font-bold text-[#9fe03c] bg-[#0b408e] px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
            {(gradeParam || typeParam) && (
              <Link
                href="/courses"
                className="ml-1 text-xs text-gray-400 hover:text-[#0b408e] transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill href="/courses" active={!typeParam && !gradeParam}>
              All
            </FilterPill>
            <FilterPill
              href="/courses?type=theory"
              active={typeParam === "theory" && !gradeParam}
            >
              Theory
            </FilterPill>
            <FilterPill
              href="/courses?type=pastpaper"
              active={typeParam === "pastpaper"}
            >
              Past Papers
            </FilterPill>
            {(typeParam === null || typeParam === "theory") && (
              <>
                <span className="text-gray-200 select-none">|</span>
                {GRADES.map((g) => (
                  <FilterPill
                    key={g}
                    href={`/courses?type=theory&grade=${g}`}
                    active={gradeParam === g && typeParam === "theory"}
                  >
                    Grade {g}
                  </FilterPill>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-12">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <BookOpen size={36} className="text-gray-200" />
            <p className="text-sm text-gray-400">No courses available</p>
          </div>
        ) : (
          <>
            {showTheory &&
              gradesToShow.map((g) => {
                const gradeCourses = coursesByGrade[g];
                if (!gradeCourses || gradeCourses.length === 0) return null;
                return (
                  <section key={g}>
                    {!gradeParam && (
                      <SectionHeading
                        label={`Grade ${g}`}
                        count={gradeCourses.length}
                      />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {gradeCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  </section>
                );
              })}

            {showPastPapers && pastPaperCourses.length > 0 && (
              <section>
                {typeParam !== "pastpaper" && (
                  <SectionHeading
                    label="Past Papers"
                    count={pastPaperCourses.length}
                  />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pastPaperCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
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
