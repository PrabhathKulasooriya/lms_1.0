"use client";

import React, { useState, useEffect } from "react";
import {
  FileQuestion,
  Search,
  Clock,
  Award,
  Eye,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import McqTestModal from "./McqTestModal";

export default function McqHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [activeReviewData, setActiveReviewData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setLoading(true);
    });

    fetch("/api/user/mcq-history")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setHistory(data.history || []);
        } else {
          toast.error(data.message || "Failed to load test history");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        toast.error(err.message || "Failed to load test history");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleReviewAttempt = (item) => {
    setActiveReviewData({
      batchId: item.batchId,
      batchTitle: item.batchTitle,
      score: item.score,
      totalQuestions: item.totalQuestions,
      percentage: item.percentage,
      timeTaken: item.timeTaken,
      completedAt: item.completedAt,
      review: item.review,
    });
    setActiveBatchId(item.batchId);
    setIsModalOpen(true);
  };

  const handleRetakeTest = (batchId) => {
    setActiveReviewData(null);
    setActiveBatchId(batchId);
    setIsModalOpen(true);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.batchTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* ── Header Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0b408e]/10 text-[#0b408e] flex items-center justify-center">
            <FileQuestion size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                MCQ Practice History
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold text-[#0b408e] bg-[#0b408e]/10 rounded-full">
                {filteredHistory.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Review your past test attempts, review answer keys, or retake assessments
            </p>
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
            placeholder="Search assessments…"
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0b408e]/20 focus:border-[#0b408e] transition-all"
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#0b408e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading test history…</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <FileQuestion size={40} className="mx-auto text-slate-300" />
          <div>
            <h3 className="text-base font-bold text-slate-700">No Assessment History Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven&apos;t completed any MCQ tests yet. Open your enrolled courses to take assessments!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Test Batch
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course & Lesson
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Score
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Time Taken
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Completed On
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const isHigh = item.percentage >= 75;
                  const isPass = item.percentage >= 50;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Batch title */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Award
                            size={16}
                            className={
                              isHigh
                                ? "text-amber-500"
                                : isPass
                                ? "text-[#0b408e]"
                                : "text-slate-400"
                            }
                          />
                          <span>{item.batchTitle}</span>
                        </div>
                      </td>

                      {/* Course & Lesson */}
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-slate-700">
                          {item.courseTitle || "Course"}
                          {item.courseGrade ? ` (G${item.courseGrade})` : ""}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {item.lessonTitle || "Lesson"}
                        </div>
                      </td>

                      {/* Score badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isHigh
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPass
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span>
                            {item.score}/{item.totalQuestions || 10}
                          </span>
                          <span className="text-[10px] opacity-80">
                            ({item.percentage}%)
                          </span>
                        </span>
                      </td>

                      {/* Time taken */}
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          <span>
                            {Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s
                          </span>
                        </div>
                      </td>

                      {/* Completed At */}
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>
                            {new Date(item.completedAt).toLocaleDateString(
                              "en-LK",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReviewAttempt(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                            title="Reopen past attempt with color-coded answers"
                          >
                            <Eye size={13} />
                            <span>Review</span>
                          </button>
                          <button
                            onClick={() => handleRetakeTest(item.batchId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b408e] hover:bg-[#093372] text-white text-xs font-bold transition-all shadow-sm"
                            title="Retake this test"
                          >
                            <RotateCcw size={13} />
                            <span>Retake</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Test & Review Modal ── */}
      <McqTestModal
        isOpen={isModalOpen}
        batchId={activeBatchId}
        initialReviewData={activeReviewData}
        onClose={() => {
          setIsModalOpen(false);
          setActiveBatchId(null);
          setActiveReviewData(null);
        }}
        onCompleted={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
