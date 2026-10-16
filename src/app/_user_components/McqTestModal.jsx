"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Award,
  Check,
  ListOrdered,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function McqTestModal({
  isOpen,
  onClose,
  batchId,
  initialReviewData = null, // If provided, opens directly in review mode
  onCompleted,
}) {
  // State management
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: "A" | "B" | "C" | "D" }
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds (1200s)
  const [isReviewMode, setIsReviewMode] = useState(!!initialReviewData);
  const [reviewResult, setReviewResult] = useState(initialReviewData);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const modalBodyRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onCompletedRef = useRef(onCompleted);

  const prevIsOpenRef = useRef(false);
  const prevBatchIdRef = useRef(null);
  const prevReviewDataRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
    onCompletedRef.current = onCompleted;
  });

  // Submit test handler
  const handleSubmitTest = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting || isReviewMode) return;
      clearInterval(timerRef.current);
      setShowConfirmSubmit(false);
      setSubmitting(true);

      const targetBatchId = batchId || batchData?.id;
      const timeTaken = startTimeRef.current
        ? Math.min(1200, Math.round((Date.now() - startTimeRef.current) / 1000))
        : 1200 - timeLeft;

      try {
        const payload = {
          batchId: targetBatchId,
          timeTaken,
          userAnswers: selectedAnswers,
        };

        const res = await fetch("/api/user/submit-mcq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to evaluate test answers");
        }

        // Seamlessly transition modal into Results view without unmounting
        setReviewResult(data.result);
        setIsReviewMode(true);

        // Smoothly scroll back to the top of the modal body so the review summary is immediately visible
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (isAutoSubmit) {
          toast("Time has expired! Test submitted automatically.", {
            icon: "⏰",
          });
        } else {
          toast.success("Test submitted successfully!");
        }

        if (onCompletedRef.current) {
          onCompletedRef.current(data.result);
        }
      } catch (err) {
        toast.error(err.message || "Failed to submit assessment");
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, isReviewMode, batchId, batchData, timeLeft, selectedAnswers]
  );

  // Load questions or review mode on modal open
  useEffect(() => {
    let isMounted = true;

    if (!isOpen) {
      clearInterval(timerRef.current);
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = !prevIsOpenRef.current && isOpen;
    const batchChanged = prevBatchIdRef.current !== batchId;
    const reviewDataChanged = prevReviewDataRef.current !== initialReviewData;

    prevIsOpenRef.current = isOpen;
    prevBatchIdRef.current = batchId;
    prevReviewDataRef.current = initialReviewData;

    // Guard: Only re-initialize when modal just opened, or batchId / initialReviewData genuinely changed
    if (!justOpened && !batchChanged && !reviewDataChanged) {
      return;
    }

    if (initialReviewData) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setReviewResult(initialReviewData);
        setIsReviewMode(true);
        setLoading(false);
      });
      return;
    }

    if (batchId) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setLoading(true);
        setIsReviewMode(false);
        setReviewResult(null);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeft(1200);
      });

      fetch(`/api/user/mcq-test?batchId=${batchId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data.success && data.batch) {
            setBatchData(data.batch);
            setTimeLeft(data.batch.timeLimit || 1200);
            startTimeRef.current = Date.now();
          } else {
            toast.error(data.message || "Failed to load test");
            if (onCloseRef.current) onCloseRef.current();
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          toast.error(err.message || "Could not load test questions");
          if (onCloseRef.current) onCloseRef.current();
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
      clearInterval(timerRef.current);
    };
  }, [isOpen, batchId, initialReviewData]);

  // 20-Minute Countdown Timer pinned at the top
  useEffect(() => {
    if (!isOpen || isReviewMode || loading || !batchData) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isOpen, isReviewMode, loading, batchData, handleSubmitTest]);

  if (!isOpen) return null;

  const handleRetake = () => {
    if (!batchId) return;
    setLoading(true);
    setIsReviewMode(false);
    setReviewResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(1200);

    fetch(`/api/user/mcq-test?batchId=${batchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.batch) {
          setBatchData(data.batch);
          setTimeLeft(data.batch.timeLimit || 1200);
          startTimeRef.current = Date.now();
          if (modalBodyRef.current) {
            modalBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else {
          toast.error(data.message || "Failed to retake test");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Could not load test");
      })
      .finally(() => setLoading(false));
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const questions = batchData?.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const totalQ = questions.length || 10;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQ - answeredCount;

  const handleSelectOption = (questionId, optionKey) => {
    if (isReviewMode) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionKey,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && isReviewMode) {
          if (onCloseRef.current) onCloseRef.current();
        }
      }}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        {/* ── Top Bar with Pinned 20-Min Timer ── */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0b408e] text-[#9fe03c] flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
              MCQ
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                  {batchData?.title ||
                    reviewResult?.batchTitle ||
                    "Multiple Choice Assessment"}
                </h2>
                {batchData?.sequence && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#9fe03c]/20 text-[#9fe03c] shrink-0">
                    Set {batchData.sequence}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {batchData?.courseTitle
                  ? `${batchData.courseTitle} • ${batchData.lessonTitle}`
                  : "NexLearn Assessment Test"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Pinned Countdown Timer (Hidden in Review Mode) */}
            {!isReviewMode && !loading && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                  timeLeft <= 120
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse"
                    : timeLeft <= 300
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-800 text-emerald-400 border-slate-700"
                }`}
              >
                <Clock size={15} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Exit/Close Button */}
            <button
              onClick={() => {
                if (!isReviewMode && answeredCount > 0) {
                  if (
                    confirm(
                      "Are you sure you want to exit? Your progress in this test will not be saved until submitted."
                    )
                  ) {
                    if (onCloseRef.current) onCloseRef.current();
                  }
                } else {
                  if (onCloseRef.current) onCloseRef.current();
                }
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-10 h-10 border-3 border-[#0b408e] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold">Loading questions...</p>
            </div>
          ) : isReviewMode ? (
            /* ─────────────────────────────────────────────────────────────
               POST-TEST REVIEW SCREEN (Itemized & Color Coded)
            ───────────────────────────────────────────────────────────── */
            <div className="space-y-6">
              {/* Summary Score Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#0b408e] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm mb-2.5">
                      <Award size={14} className="text-[#9fe03c]" />
                      Assessment Summary
                    </div>
                    <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                      {reviewResult?.percentage >= 75
                        ? "Outstanding Performance!"
                        : reviewResult?.percentage >= 50
                        ? "Good Job! Test Passed"
                        : "Review & Keep Practicing"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Review all 10 questions and check the correct answer keys below.
                    </p>
                  </div>

                  {/* Score & Time Badges */}
                  <div className="flex items-center justify-around sm:justify-start gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-white/10 shrink-0">
                    <div className="text-center">
                      <div className="text-2xl sm:text-4xl font-black text-[#9fe03c]">
                        {reviewResult?.score}
                        <span className="text-base sm:text-lg font-medium text-slate-300">
                          /{reviewResult?.totalQuestions || 10}
                        </span>
                      </div>
                      <div className="inline-block mt-0.5 sm:mt-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-extrabold bg-[#9fe03c] text-[#0b408e]">
                        {reviewResult?.percentage}%
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-white flex items-center justify-center gap-1">
                        <Clock size={16} className="text-slate-300" />
                        {Math.floor((reviewResult?.timeTaken || 0) / 60)}m{" "}
                        {(reviewResult?.timeTaken || 0) % 60}s
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 mt-0.5">
                        Time Taken
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized 10 Questions Review */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ListOrdered size={16} className="text-[#0b408e]" />
                    Question Review ({reviewResult?.review?.length || 10} Questions)
                  </h4>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={13} />
                      {reviewResult?.score} Correct
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <XCircle size={13} />
                      {(reviewResult?.totalQuestions || 10) -
                        (reviewResult?.score || 0)}{" "}
                      Incorrect
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviewResult?.review?.map((q, idx) => {
                    const isCorrect = q.isCorrect;
                    const selected = q.selectedOption;
                    const correct = q.correctOption;

                    return (
                      <div
                        key={q.questionId || idx}
                        className={`rounded-2xl border p-5 transition-all ${
                          isCorrect
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-rose-600 text-white"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-snug">
                                {q.questionText}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                              isCorrect
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <Check size={14} /> Correct (+1)
                              </>
                            ) : (
                              <>
                                <X size={14} /> Incorrect (0)
                              </>
                            )}
                          </span>
                        </div>

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                          {["A", "B", "C", "D"].map((optKey) => {
                            const optText = q[`option${optKey}`];
                            const isUserSelection = selected === optKey;
                            const isOfficialCorrect = correct === optKey;

                            let optStyle =
                              "bg-white/80 border-slate-200 text-slate-700";
                            let badge = null;

                            if (isOfficialCorrect) {
                              optStyle =
                                "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-300";
                              badge = (
                                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded ml-auto flex items-center gap-1">
                                  <Check size={11} /> Correct Answer
                                </span>
                              );
                            } else if (isUserSelection && !isCorrect) {
                              optStyle =
                                "bg-rose-100 border-rose-400 text-rose-950 font-bold";
                              badge = (
                                <span className="text-[10px] uppercase font-bold text-rose-800 bg-rose-200 px-1.5 py-0.5 rounded ml-auto flex items-center gap-1">
                                  <X size={11} /> Your Choice
                                </span>
                              );
                            }

                            return (
                              <div
                                key={optKey}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${optStyle}`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                    isOfficialCorrect
                                      ? "bg-emerald-600 text-white"
                                      : isUserSelection && !isCorrect
                                      ? "bg-rose-600 text-white"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {optKey}
                                </span>
                                <span className="flex-1">{optText}</span>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               ACTIVE STEPPER TEST ENVIRONMENT (Questions 1 - 10)
            ───────────────────────────────────────────────────────────── */
            <div className="space-y-6">
              {/* Stepper Progress Bar (1 to 10) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                  <span className="font-semibold text-slate-700">
                    Question Progress
                  </span>
                  <span>
                    Answered: <strong className="text-slate-900">{answeredCount}</strong> / {totalQ}
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[String(q.id)] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <button
                        key={q.id || idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-[#0b408e] text-white shadow-md ring-2 ring-[#0b408e]/30 scale-105"
                            : isAnswered
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title={`Question ${idx + 1}${isAnswered ? " (Answered)" : " (Unanswered)"}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Single Question Card */}
              {currentQ ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
                  {/* Question Number Stepper Indicator */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0b408e]/10 text-[#0b408e] mb-2.5">
                      <span>Question {currentQuestionIndex + 1} of {totalQ}</span>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
                      {currentQ.questionText}
                    </h3>
                  </div>

                  {/* 4 Choices (A, B, C, D) using Radio Buttons */}
                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                    {["A", "B", "C", "D"].map((key) => {
                      const optText = currentQ[`option${key}`];
                      const isSelected =
                        selectedAnswers[String(currentQ.id)] === key;

                      return (
                        <label
                          key={key}
                          className={`w-full flex items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-50/70 border-[#0b408e] text-slate-900 shadow-sm ring-1 ring-[#0b408e]/20"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {/* Radio Button */}
                          <input
                            type="radio"
                            name={`question-choice-${currentQ.id}`}
                            value={key}
                            checked={isSelected}
                            onChange={() => handleSelectOption(currentQ.id, key)}
                            className="w-4 h-4 mt-0.5 sm:mt-0 text-[#0b408e] focus:ring-[#0b408e] cursor-pointer shrink-0"
                          />

                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#0b408e] text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {key}
                          </span>

                          <span className="text-xs sm:text-sm font-medium flex-1 leading-snug sm:leading-normal">
                            {optText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle size={32} className="mx-auto mb-2 text-slate-300" />
                  <p>No question content loaded.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {isReviewMode ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Results saved to your dashboard history.
              </span>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                {batchId && (
                  <button
                    onClick={handleRetake}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Retake Test
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onCloseRef.current) onCloseRef.current();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b408e] text-white text-xs font-bold hover:bg-[#093372] transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-2">
              {/* Prev button */}
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  {answeredCount}/{totalQ} <span className="hidden sm:inline">Answered</span>
                </span>
              </div>

              {/* Next / Submit on question 10 */}
              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQ - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(totalQ - 1, prev + 1)
                      )
                    }
                    className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (unansweredCount > 0) {
                        setShowConfirmSubmit(true);
                      } else {
                        handleSubmitTest(false);
                      }
                    }}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-[#0b408e] hover:bg-[#093372] text-white text-xs font-bold transition-all shadow-md shadow-[#0b408e]/20 disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{submitting ? "Submitting..." : "Submit Test"}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Unanswered Questions Confirmation Dialog ── */}
        {showConfirmSubmit && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Unanswered Questions
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  You still have{" "}
                  <strong className="text-slate-800">
                    {unansweredCount} unanswered
                  </strong>{" "}
                  question{unansweredCount > 1 ? "s" : ""}. Are you sure you
                  want to submit now?
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Review Questions
                </button>
                <button
                  onClick={() => handleSubmitTest(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0b408e] hover:bg-[#093372] transition-colors shadow-sm"
                >
                  {submitting ? "Submitting..." : "Yes, Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
