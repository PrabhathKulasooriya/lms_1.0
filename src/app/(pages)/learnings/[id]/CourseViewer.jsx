"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Tag,
  Hash,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Maximize,
  Loader2,
} from "lucide-react";

export default function CourseViewer({ course }) {
  const defaultResource = course.lessons?.[0]?.resources?.[0] || null;
  const [activeResource, setActiveResource] = useState(defaultResource);
  const [openLessons, setOpenLessons] = useState(
    course.lessons?.[0] ? [course.lessons[0].id] : [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const pdfWrapperRef = useRef(null);

  // ── FIX: Added a safety timeout to prevent infinite loading ──
  useEffect(() => {
    if (activeResource) {
      setIsLoading(true);

      // Fallback: Force the loader to disappear after 2 seconds
      // just in case the iframe's native PDF plugin blocks the onLoad event.
      const safetyTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      // Cleanup timer if the user clicks another resource quickly
      return () => clearTimeout(safetyTimer);
    }
  }, [activeResource]);

  const toggleLesson = (lessonId) => {
    setOpenLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    );
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handlePdfFullScreen = () => {
    if (!pdfWrapperRef.current) return;

    if (!document.fullscreenElement) {
      pdfWrapperRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* ── Course Header Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span
              className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.type === "pastpaper"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {course.type === "pastpaper" ? "Past Paper" : "Theory"}
            </span>

            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-1">
              {course.grade && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Hash size={14} className="text-gray-400" />
                  <span>Grade {course.grade}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Tag size={14} className="text-gray-400" />
                <span>LKR {Number(course.price).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <BookOpen size={14} className="text-gray-400" />
                <span>{totalLessons} Lessons</span>
              </div>
            </div>
          </div>

          <div className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
            <ShieldCheck size={15} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">
              Enrolled
            </span>
          </div>
        </div>
      </div>

      {/* ── Player & Content Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video/PDF Player */}
        <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden shadow-sm flex items-center justify-center min-h-[400px] h-full max-h-[600px] border border-gray-200 relative">
          {!activeResource ? (
            <div className="text-gray-400">
              Select a resource to begin viewing.
            </div>
          ) : (
            <>
              {/* ── Loading Overlay ── */}
              {isLoading && (
                <div
                  className={`absolute inset-0 z-10 flex items-center justify-center ${
                    activeResource.type === "video" ? "bg-black" : "bg-white"
                  }`}
                >
                  <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
              )}

              {activeResource.type === "video" ? (
                <video
                  key={activeResource.id}
                  src={activeResource.file_url}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={handleContextMenu}
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                  className="w-full h-full object-contain bg-black"
                >
                  Your browser does not support the video tag.
                </video>
              ) : activeResource.type === "pdf" ? (
                <div
                  ref={pdfWrapperRef}
                  className="relative w-full h-full bg-white flex flex-col"
                >
                  <iframe
                    key={activeResource.id}
                    src={`${activeResource.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    onContextMenu={handleContextMenu}
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                    className="w-full h-full border-none"
                    title={activeResource.title}
                  />
                  <button
                    onClick={handlePdfFullScreen}
                    className="absolute top-4 right-6 bg-gray-800/50 hover:bg-gray-800 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all z-20"
                    title="Toggle Full Screen"
                  >
                    <Maximize size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">Unsupported format.</div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Lessons Accordion */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px] lg:h-[600px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
            <GraduationCap size={20} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Course Content
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full ml-auto">
              {totalLessons}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {course.lessons?.map((lesson) => (
              <div
                key={lesson.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-800 text-sm">
                    {lesson.sequence}. {lesson.title}
                  </span>
                  {openLessons.includes(lesson.id) ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </button>

                {openLessons.includes(lesson.id) && (
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex flex-col gap-1">
                    {lesson.resources?.length === 0 && (
                      <p className="text-xs text-gray-400 py-2">
                        No resources available.
                      </p>
                    )}
                    {lesson.resources?.map((resource) => {
                      const isActive = activeResource?.id === resource.id;
                      return (
                        <button
                          key={resource.id}
                          onClick={() => setActiveResource(resource)}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                            isActive
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-200 text-gray-600"
                          }`}
                        >
                          {resource.type === "video" ? (
                            <PlayCircle
                              size={16}
                              className={
                                isActive ? "text-blue-600" : "text-gray-400"
                              }
                            />
                          ) : (
                            <FileText
                              size={16}
                              className={
                                isActive ? "text-blue-600" : "text-gray-400"
                              }
                            />
                          )}
                          <span className="text-sm truncate w-full">
                            {resource.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
