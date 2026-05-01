"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Video,
  FileText,
} from "lucide-react";

// 1. Accept 'lessons' as a prop
const LessonAccordion = ({ lessons = [] }) => {
  const [openLessons, setOpenLessons] = useState(new Set());

  const toggle = (id) => {
    setOpenLessons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 2. Map over the 'lessons' prop instead of DUMMY_LESSONS */}
      {lessons.map((lesson, index) => {
        const isOpen = openLessons.has(lesson.id);
        return (
          <div
            key={lesson.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggle(lesson.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/70 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {lesson.sequence || index + 1}
                </span>
                <div>
                  {/* Increased font size here as requested previously */}
                  <p className="text-base font-semibold text-gray-900">
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {/* Using real lesson duration if it exists, otherwise a placeholder */}
                      {lesson.duration || "Duration not set"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className="hidden sm:inline text-xs font-medium text-blue-600">
                  {isOpen ? "Collapse" : "Expand"}
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-5 flex flex-col gap-5">
                {/* Real Description from Database */}
                <div className="flex gap-3">
                  <BookOpen
                    size={16}
                    className="text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {lesson.description ||
                      "No description available for this lesson."}
                  </p>
                </div>

                {/* Real Resources from Database */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lesson.resources?.map((resource) => (
                    <div
                      key={resource.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3"
                    >
                      {resource.type === "video" ? (
                        <Video size={20} className="text-blue-500" />
                      ) : (
                        <FileText size={20} className="text-purple-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {resource.type}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!lesson.resources || lesson.resources.length === 0) && (
                    <p className="text-xs text-gray-400 col-span-2 text-center py-4 border-2 border-dashed rounded-xl">
                      No downloadable resources for this lesson.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LessonAccordion;
