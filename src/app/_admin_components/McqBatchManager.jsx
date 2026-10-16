"use client";

import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";

const createEmptyQuestion = (index) => ({
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
});

export default function McqBatchManager({
  isOpen,
  onClose,
  lesson,
  batchToEdit = null,
  onBatchSaved,
  onBatchCreated,
}) {
  const isEditMode = !!batchToEdit;
  const [title, setTitle] = useState("Batch 01");
  const [sequence, setSequence] = useState(1);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, (_, i) => createEmptyQuestion(i))
  );

  React.useEffect(() => {
    let isMounted = true;
    if (!isOpen) return;

    Promise.resolve().then(() => {
      if (!isMounted) return;

      if (batchToEdit) {
        setTitle(batchToEdit.title || "Batch 01");
        setSequence(batchToEdit.sequence || 1);
        setActiveQIndex(0);

        if (Array.isArray(batchToEdit.questions) && batchToEdit.questions.length === 10) {
          setQuestions(
            batchToEdit.questions.map((q) => ({
              id: q.id ?? null,
              questionText: q.questionText || q.question_text || "",
              optionA: q.optionA || q.option_a || "",
              optionB: q.optionB || q.option_b || "",
              optionC: q.optionC || q.option_c || "",
              optionD: q.optionD || q.option_d || "",
              correctOption: (q.correctOption || q.correct_option || "A").toUpperCase(),
            }))
          );
        }
      } else {
        setTitle("Batch 01");
        setSequence(1);
        setActiveQIndex(0);
        setQuestions(Array.from({ length: 10 }, (_, i) => createEmptyQuestion(i)));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, batchToEdit]);

  if (!isOpen || !lesson) return null;

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };


  // Client-side validation ensuring all 10 questions and their respective correct answers are provided
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Batch title is required");
      return;
    }

    for (let i = 0; i < 10; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        toast.error(`Question #${i + 1} is missing its question text`);
        setActiveQIndex(i);
        return;
      }
      if (
        !q.optionA?.trim() ||
        !q.optionB?.trim() ||
        !q.optionC?.trim() ||
        !q.optionD?.trim()
      ) {
        toast.error(`Question #${i + 1} must have all 4 options (A, B, C, D) filled`);
        setActiveQIndex(i);
        return;
      }
      if (!["A", "B", "C", "D"].includes(q.correctOption)) {
        toast.error(`Question #${i + 1} must designate a valid correct answer (A, B, C, or D)`);
        setActiveQIndex(i);
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading(
      isEditMode
        ? "Updating MCQ Batch and 10 questions..."
        : "Saving MCQ Batch and 10 questions..."
    );

    try {
      const method = isEditMode ? "PUT" : "POST";
      const payload = {
        ...(isEditMode && { id: batchToEdit.id }),
        lessonId: lesson.id,
        title: title.trim(),
        sequence: parseInt(sequence) || 1,
        questions,
      };

      const res = await fetch("/api/admin/mcq-batches", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${isEditMode ? "update" : "create"} batch`);
      }

      toast.success(
        isEditMode
          ? "MCQ Batch and 10 questions updated successfully!"
          : "MCQ Batch with 10 questions created successfully!",
        { id: toastId }
      );

      if (isEditMode) {
        if (onBatchSaved) onBatchSaved(data.batch);
      } else {
        if (onBatchCreated) onBatchCreated(data.batch);
        if (onBatchSaved) onBatchSaved(data.batch);
      }
      onClose();
    } catch (err) {
      toast.error(
        err.message || `Failed to ${isEditMode ? "update" : "create"} MCQ Batch`,
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[activeQIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0b408e]" />
              <h3 className="text-base font-bold text-slate-800">
                {isEditMode
                  ? `Edit MCQ Batch: ${batchToEdit.title} (10 Questions)`
                  : "Add MCQ Assessment Batch (10 Questions)"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Lesson: <span className="text-slate-700 font-semibold">{lesson.title}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Batch Title & Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Batch 01, Revision Set A"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b408e]/20 focus:border-[#0b408e] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sequence Order
              </label>
              <div className="relative">
                <Hash
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="number"
                  min="1"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b408e]/20 focus:border-[#0b408e] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Stepper Navigation (1 - 10) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question Stepper (1 to 10)
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Editing Question <strong className="text-slate-800">{activeQIndex + 1}</strong> of 10
              </span>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {questions.map((q, idx) => {
                const isComplete =
                  q.questionText?.trim() &&
                  q.optionA?.trim() &&
                  q.optionB?.trim() &&
                  q.optionC?.trim() &&
                  q.optionD?.trim();

                const isCurrent = idx === activeQIndex;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-[#0b408e] text-white shadow-md ring-2 ring-[#0b408e]/30 scale-105"
                        : isComplete
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Question #{activeQIndex + 1} Prompt</span>
                <span className="text-[11px] font-normal text-slate-400">
                  Must be filled
                </span>
              </label>
              <textarea
                rows={2}
                value={currentQ.questionText}
                onChange={(e) =>
                  handleQuestionChange(activeQIndex, "questionText", e.target.value)
                }
                placeholder="Enter question text..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b408e]/20 focus:border-[#0b408e] transition-all"
                required
              />
            </div>

            {/* 4 Options with Radio Selectors */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Options & Designate Correct Answer
              </label>
              {["A", "B", "C", "D"].map((optKey) => {
                const isCorrect = currentQ.correctOption === optKey;

                return (
                  <label
                    key={optKey}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isCorrect
                        ? "bg-emerald-50/90 border-emerald-400 ring-1 ring-emerald-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Radio input */}
                    <div className="flex items-center justify-center">
                      <input
                        type="radio"
                        name={`correct-answer-${activeQIndex}`}
                        value={optKey}
                        checked={isCorrect}
                        onChange={() =>
                          handleQuestionChange(activeQIndex, "correctOption", optKey)
                        }
                        className="w-4 h-4 text-[#0b408e] focus:ring-[#0b408e] cursor-pointer"
                      />
                    </div>

                    <span
                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {optKey}
                    </span>

                    <input
                      type="text"
                      value={currentQ[`option${optKey}`]}
                      onChange={(e) =>
                        handleQuestionChange(
                          activeQIndex,
                          `option${optKey}`,
                          e.target.value
                        )
                      }
                      placeholder={`Enter text for Option ${optKey}...`}
                      className="flex-1 px-2.5 py-1 text-xs bg-transparent border-0 focus:outline-none text-slate-800"
                      required
                    />

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {isCorrect ? "Correct Option" : "Set Correct"}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Stepper controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={activeQIndex === 0}
                onClick={() => setActiveQIndex((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} /> Previous Question
              </button>
              <button
                type="button"
                disabled={activeQIndex === 9}
                onClick={() => setActiveQIndex((p) => Math.min(9, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0b408e] hover:text-[#093372] disabled:opacity-40 transition-colors"
              >
                Next Question <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0b408e] hover:bg-[#093372] rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>
                {submitting
                  ? isEditMode
                    ? "Updating Batch..."
                    : "Saving Batch..."
                  : isEditMode
                  ? "Update MCQ Batch (10 Questions)"
                  : "Save MCQ Batch (10 Questions)"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
