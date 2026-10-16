"use client";

import React, { useState, useEffect } from "react";
import {
  FileQuestion,
  Award,
  Clock,
  PlayCircle,
  Eye,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function LessonMcqBatches({
  lessonId,
  onTakeTest,
  onReviewTest,
  refreshTrigger = 0,
}) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!lessonId) return;

    Promise.resolve().then(() => {
      if (isMounted) setLoading(true);
    });

    fetch(`/api/user/mcq-batches?lessonId=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setBatches(data.batches || []);
        }
      })
      .catch((err) => {
        console.error("[LessonMcqBatches] Failed to fetch batches:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lessonId, refreshTrigger]);

  if (loading) {
    return (
      <div className="py-2 px-3 text-xs text-slate-400 flex items-center gap-2">
        <span className="w-3.5 h-3.5 border-2 border-[#0b408e] border-t-transparent rounded-full animate-spin" />
        <span>Loading assessments...</span>
      </div>
    );
  }

  if (batches.length === 0) {
    return null; // Don't take up space if no MCQ batches configured for this lesson
  }

  return (
    <div className="mt-2 space-y-2">
      {batches.map((batch) => {
        const isCompleted = batch.isCompleted;

        return (
          <div
            key={batch.id}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#0b408e]/10 text-[#0b408e]"
                }`}
              >
                {isCompleted ? <Award size={16} /> : <FileQuestion size={16} />}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {batch.title}
                  </h4>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={10} />
                      Score: {batch.lastAttempt?.score ?? batch.highScore}/
                      {batch.totalQuestions || 10} (
                      {batch.lastAttempt?.percentage ?? batch.highestPercentage}
                      %)
                    </span>
                  )}
                </div>

                {!isCompleted && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{batch.totalQuestions || 10} Questions</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      20 Min Limit
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
              {isCompleted ? (
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onReviewTest && onReviewTest(batch.id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  >
                    <Eye size={12} />
                    <span>Review</span>
                  </button>
                  <button
                    onClick={() => onTakeTest && onTakeTest(batch.id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b408e] hover:bg-[#093372] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <RotateCcw size={12} />
                    <span>Retake</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onTakeTest && onTakeTest(batch.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0b408e] hover:bg-[#093372] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <PlayCircle size={13} />
                  <span>Start Test</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
