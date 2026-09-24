"use client";

import React, { useState } from "react";
import { Search, GraduationCap, Eye, ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

const UserCourseList = ({ enrollments = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEnrollments = enrollments
    .filter(
      (item) =>
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.grade?.toString().includes(searchTerm),
    )
    .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at));

  return (
    <div className="w-full space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0b408e]/10 text-[#0b408e] flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                My Enrolled Courses
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold text-[#0b408e] bg-[#0b408e]/10 rounded-full">
                {filteredEnrollments.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">Access your active learning modules & resources</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0b408e]/20 focus:border-[#0b408e] transition-all"
          />
        </div>
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-left">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Course Title
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Grade
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fee
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enrolled On
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">You have not enrolled in any courses yet.</p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {enrollment.course.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          enrollment.course.type === "pastpaper"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {enrollment.course.type === "pastpaper"
                          ? "Past Paper"
                          : "Theory"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {enrollment.course.grade ? (
                        `Grade ${enrollment.course.grade}`
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      LKR {Number(enrollment.course.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {enrollment.enrolled_at ? (
                        new Date(enrollment.enrolled_at).toLocaleDateString(
                          "en-LK",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          enrollment.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${enrollment.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {enrollment.is_active ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/learnings/${enrollment.course.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0b408e] hover:bg-[#093372] text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards View ── */}
      <div className="flex md:hidden flex-col gap-4">
        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No courses enrolled yet.</p>
          </div>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#0b408e] mt-1">
                    LKR {Number(enrollment.course.price).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    enrollment.is_active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${enrollment.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {enrollment.is_active ? "Active" : "Expired"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    enrollment.course.type === "pastpaper"
                      ? "bg-purple-50 text-purple-700 border border-purple-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {enrollment.course.type === "pastpaper"
                    ? "Past Paper"
                    : "Theory"}
                </span>
                {enrollment.course.grade && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Grade {enrollment.course.grade}
                  </span>
                )}
              </div>

              <Link
                href={`/learnings/${enrollment.course.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-[#0b408e] hover:bg-[#093372] rounded-xl shadow-md transition-all"
              >
                <Eye size={15} />
                <span>View Course Lessons</span>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserCourseList;
