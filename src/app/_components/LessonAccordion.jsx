"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  BookOpen,
  Clock,
  Video,
} from "lucide-react";

const DUMMY_LESSONS = [
  {
    id: 1,
    title: "Introduction to the Course",
    description:
      "Get familiar with the course structure, objectives, and what you will achieve by the end. We cover the foundational concepts and set the stage for deeper learning.",
    duration: "18 min",
  },
  {
    id: 2,
    title: "Core Concepts & Theory",
    description:
      "Dive into the fundamental theoretical framework. We explore key principles, definitions, and the essential building blocks that underpin the entire subject.",
    duration: "32 min",
  },
  {
    id: 3,
    title: "Practical Applications",
    description:
      "Apply what you have learned to real-world scenarios. Worked examples and guided walkthroughs help you build confidence in applying theory to practice.",
    duration: "45 min",
  },
  {
    id: 4,
    title: "Advanced Problem Solving",
    description:
      "Challenge yourself with complex problems that require deeper reasoning. This lesson pushes beyond the basics and introduces exam-level thinking strategies.",
    duration: "52 min",
  },
  {
    id: 5,
    title: "Revision & Past Paper Walkthrough",
    description:
      "A comprehensive revision session covering all major topics. Includes a full walkthrough of a past paper question with detailed explanations for every step.",
    duration: "40 min",
  },
];

const LessonAccordion = () => {
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
      {DUMMY_LESSONS.map((lesson, index) => {
        const isOpen = openLessons.has(lesson.id);
        return (
          <div
            key={lesson.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200"
          >
            {/* ── Lesson Header ── */}
            <button
              onClick={() => toggle(lesson.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/70 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                {/* Lesson Number */}
                <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {lesson.duration}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className="hidden sm:inline text-xs font-medium text-blue-600">
                  {isOpen ? "Collapse" : "Expand"}
                </span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </div>
            </button>

            {/* ── Expanded Content ── */}
            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-5 flex flex-col gap-5">
                {/* Description */}
                <div className="flex gap-3">
                  <BookOpen
                    size={16}
                    className="text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>

                {/* Resources Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Video Placeholder */}
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 flex flex-col items-center justify-center gap-2 min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Video size={20} className="text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      Video Lesson
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      Video content will appear here
                    </p>
                  </div>

                  {/* PDF Placeholder */}
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 flex flex-col items-center justify-center gap-2 min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText size={20} className="text-purple-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      PDF Notes
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      PDF resources will appear here
                    </p>
                  </div>
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
