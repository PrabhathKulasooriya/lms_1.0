"use client";
import React, { useState } from "react";
import { Search, GraduationCap, Eye } from "lucide-react";
import Link from "next/link";

const UserCourseList = ({ enrollments }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEnrollments = enrollments
    .filter(
      (item) =>
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.grade?.toString().includes(searchTerm),
    )
    .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at));

  return (
    <div className="pt-2 w-full px-4 md:px-8 pb-8">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap size={24} className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">My Courses</h1>
          <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            {filteredEnrollments.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or grade…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* ── Desktop Table (unchanged) ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Title
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Type
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Grade
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Price
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Enrolled On
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    You are not enrolled in any courses yet.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {enrollment.course.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.course.type === "pastpaper"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {enrollment.course.type === "pastpaper"
                          ? "Past Paper"
                          : "Theory"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {enrollment.course.grade ? (
                        `Grade ${enrollment.course.grade}`
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      LKR {Number(enrollment.course.price).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
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
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {enrollment.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/learnings/${enrollment.course.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye size={16} className="inline-block mr-2" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="flex md:hidden flex-col gap-3">
        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
            You are not enrolled in any courses yet.
          </div>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex flex-col gap-3"
            >
              {/* Title + badges row */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {enrollment.course.title}
                </p>
                <span
                  className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    enrollment.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {enrollment.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    enrollment.course.type === "pastpaper"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {enrollment.course.type === "pastpaper"
                    ? "Past Paper"
                    : "Theory"}
                </span>
                {enrollment.course.grade && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Grade {enrollment.course.grade}
                  </span>
                )}
              </div>

              {/* Price + date row */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  LKR {Number(enrollment.course.price).toLocaleString()}
                </span>
                <span>
                  {enrollment.enrolled_at
                    ? new Date(enrollment.enrolled_at).toLocaleDateString(
                        "en-LK",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "—"}
                </span>
              </div>

              {/* View button */}
              <Link
                href={`/learnings/${enrollment.course.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <Eye size={15} />
                View Course
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserCourseList;
