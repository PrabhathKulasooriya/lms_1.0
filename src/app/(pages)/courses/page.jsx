"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";
import CourseCardClient from "@/app/_components/CourseCardClient";

const getCourses = unstable_cache(
  async () => {
    try {
      return await prisma.courses.findMany({
        where: { is_published: true },
        orderBy: { created_at: "desc" },
      });
    } catch (err) {
      console.error("Error fetching courses from database:", err?.message || err);
      return [];
    }
  },
  ["courses-data"],
  { tags: ["courses-data"], revalidate: 86400 },
);

const GRADES = [10, 11];

function FilterPill({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-300 ${
        active
          ? "bg-[#9fe03c] text-[#0b408e] shadow-md shadow-[#9fe03c]/20 scale-[1.02]"
          : "bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 hover:bg-white/20 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function SectionHeading({ label, count }) {
  return (
    <div className="flex items-center gap-3.5 mb-8">
      <span className="w-1.5 h-6 rounded-full bg-[#9fe03c]" />
      <h2 className="text-lg md:text-xl font-semibold text-[#0b408e] tracking-tight">
        {label}
      </h2>
      <span className="text-xs font-medium text-[#0b408e] bg-[#9fe03c] px-2.5 py-0.5 rounded-full leading-none shadow-sm">
        {count}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export default async function Page({ searchParams }) {
  const params = (await searchParams) || {};
  const { grade, type } = params;

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
      ? "Past Paper Discussions"
      : typeParam === "theory" && gradeParam
        ? `Grade ${gradeParam} Commerce Theory`
        : typeParam === "theory"
          ? "Theory Courses"
          : gradeParam
            ? `Grade ${gradeParam} Courses`
            : "Explore All Courses";

  return (
    <div className="min-h-screen w-full bg-slate-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      {/* Header Banner */}
      <div className="relative pt-28 pb-16 bg-[#071933] text-white overflow-hidden">
        {/* Background Blur Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0b408e]/40 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#9fe03c] text-xs font-medium uppercase tracking-wider mb-4">
            <GraduationCap size={14} className="text-[#FFD700]" />
            <span>NexLearn Catalog</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-semibold tracking-normal text-white mb-3">
            {pageTitle}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed mb-8">
            Comprehensive Grade 10 & 11 Commerce theory lessons, revision modules, and past paper discussions.
          </p>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <FilterPill href="/courses" active={!typeParam && !gradeParam}>
              All Courses ({courses.length})
            </FilterPill>
            <FilterPill
              href="/courses?type=theory"
              active={typeParam === "theory" && !gradeParam}
            >
              Theory ({theoryCourses.length})
            </FilterPill>
            <FilterPill
              href="/courses?type=pastpaper"
              active={typeParam === "pastpaper"}
            >
              Past Papers ({pastPaperCourses.length})
            </FilterPill>
            {(typeParam === null || typeParam === "theory") && (
              <>
                <span className="text-white/20 select-none mx-1">|</span>
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-200/80 p-12 max-w-md mx-auto shadow-sm">
            <BookOpen size={48} className="text-slate-300 mb-4" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No Courses Found
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              There are currently no courses matching the selected filters.
            </p>
            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-xl bg-[#0b408e] text-white text-xs font-medium hover:bg-[#093372] transition"
            >
              View All Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {showTheory &&
              gradesToShow.map((g) => {
                const gradeCourses = coursesByGrade[g];
                if (!gradeCourses || gradeCourses.length === 0) return null;
                return (
                  <section key={g}>
                    {!gradeParam && (
                      <SectionHeading
                        label={`Grade ${g} Commerce Theory`}
                        count={gradeCourses.length}
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {gradeCourses.map((course) => (
                        <CourseCardClient key={course.id} course={course} />
                      ))}
                    </div>
                  </section>
                );
              })}

            {showPastPapers && pastPaperCourses.length > 0 && (
              <section>
                {typeParam !== "pastpaper" && (
                  <SectionHeading
                    label="Past Paper Discussions & Marking Schemes"
                    count={pastPaperCourses.length}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastPaperCourses.map((course) => (
                    <CourseCardClient key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
