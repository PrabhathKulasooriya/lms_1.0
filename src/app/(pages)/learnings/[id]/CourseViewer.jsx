"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  FileQuestion,
  Sparkles,
} from "lucide-react";

import YouTubePlayer from "./YouTubePlayer";
import McqTestModal from "@/app/_components/McqTestModal";
import LessonMcqBatches from "@/app/_components/LessonMcqBatches";

export default function CourseViewer({ course }) {
  const isMcqCourse = course.type === "mcq";
  const defaultResource = course.lessons?.[0]?.resources?.[0] || null;
  const [activeResource, setActiveResource] = useState(defaultResource);
  const [openLessons, setOpenLessons] = useState(
    course.lessons?.[0] ? [course.lessons[0].id] : [],
  );

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedReviewData, setSelectedReviewData] = useState(null);
  const [batchRefreshKey, setBatchRefreshKey] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const pdfWrapperRef = useRef(null);

  // Safety timeout & loading reset on resource change
  useEffect(() => {
    if (activeResource) {
      Promise.resolve().then(() => setIsLoading(true));

      const safetyTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

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

  const handleTakeTest = (batchId) => {
    setSelectedBatchId(batchId);
    setSelectedReviewData(null);
    setTestModalOpen(true);
  };

  const handleReviewTest = async (batchId) => {
    try {
      const res = await fetch(`/api/user/mcq-history?batchId=${batchId}&limit=1`);
      const data = await res.json();
      if (data.success && data.history?.length > 0) {
        setSelectedReviewData(data.history[0]);
      } else {
        setSelectedReviewData(null);
      }
      setSelectedBatchId(batchId);
      setTestModalOpen(true);
    } catch {
      setSelectedBatchId(batchId);
      setTestModalOpen(true);
    }
  };

  const handleCloseModal = useCallback(() => {
    setTestModalOpen(false);
    setSelectedBatchId(null);
    setSelectedReviewData(null);
  }, []);

  const handleTestCompleted = useCallback(() => {
    setBatchRefreshKey((prev) => prev + 1);
  }, []);

  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 flex flex-col gap-6">
      {/* ── Course Header Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span
              className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.type === "pastpaper"
                  ? "bg-purple-100 text-purple-700"
                  : course.type === "mcq"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {course.type === "pastpaper"
                ? "Past Paper"
                : course.type === "mcq"
                ? "MCQ Assessment"
                : "Theory"}
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
        {/* Left Column: MCQ Hub OR Video/PDF Player */}
        {isMcqCourse ? (
          <div className="lg:col-span-2 bg-gradient-to-br from-[#071933] to-[#0b408e] text-white rounded-3xl p-8 flex flex-col justify-between shadow-sm min-h-[420px] relative overflow-hidden border border-slate-700/50">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold mb-4">
                <FileQuestion size={14} />
                <span>MCQ Assessment Mode</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                {course.title}
              </h2>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Practice with timed MCQ test batches. Each batch contains 10 questions with a 20-minute countdown, instant automated evaluation, and detailed explanations for each option.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Test Format</p>
                <p className="text-lg font-bold text-white mt-1">10 Questions</p>
                <p className="text-xs text-slate-400">Multiple choice A to D</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Time Limit</p>
                <p className="text-lg font-bold text-white mt-1">20 Minutes</p>
                <p className="text-xs text-slate-400">Countdown timer</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Review</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">Instant Grading</p>
                <p className="text-xs text-slate-400">Color-coded answers</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 border-t border-white/10 pt-4">
              <Sparkles size={14} className="text-[#9fe03c]" />
              <span>Select any test batch from the right sidebar to start your practice test.</span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden shadow-sm flex items-center justify-center w-full aspect-video border border-gray-200 relative">
            {!activeResource ? (
              <div className="text-gray-400">
                Select a resource to begin viewing.
              </div>
            ) : (
              <>
                {/* ── Loading Overlay ── */}
                {isLoading && (
                  <div
                    className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none ${
                      activeResource.type === "video" ? "bg-black" : "bg-white"
                    }`}
                  >
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                  </div>
                )}

                {activeResource.type === "video" ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                    <YouTubePlayer
                      key={activeResource.id}
                      url={activeResource.file_url}
                      title={activeResource.title}
                      onReady={() => setIsLoading(false)}
                      onError={() => setIsLoading(false)}
                    />
                  </div>
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
        )}

        {/* Right Column: Lessons Accordion */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
            <GraduationCap size={20} className={isMcqCourse ? "text-emerald-600" : "text-blue-600"} />
            <h2 className="text-base font-bold text-gray-900">
              {isMcqCourse ? "MCQ Test Modules" : "Course Content"}
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ml-auto ${
                isMcqCourse
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-blue-700 bg-blue-100"
              }`}
            >
              {totalLessons}
            </span>
          </div>

          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto p-4 flex flex-col gap-3">
            {course.lessons?.map((lesson) => (
              <div
                key={lesson.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-800 text-lg">
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
                    {isMcqCourse ? (
                      /* MCQ Mode: ONLY render MCQ Test Batches */
                      <LessonMcqBatches
                        lessonId={lesson.id}
                        onTakeTest={handleTakeTest}
                        onReviewTest={handleReviewTest}
                        refreshTrigger={batchRefreshKey}
                      />
                    ) : (
                      /* Theory / Past Paper Mode: ONLY render Video/PDF resources */
                      <>
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
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timed Interactive MCQ Test Modal ── */}
      <McqTestModal
        isOpen={testModalOpen}
        batchId={selectedBatchId}
        initialReviewData={selectedReviewData}
        onClose={handleCloseModal}
        onCompleted={handleTestCompleted}
      />
    </div>
  );
}