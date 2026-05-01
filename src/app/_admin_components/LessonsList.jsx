"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SquarePlus,
  Edit,
  Trash2,
  FileVideo,
  FileText,
  Plus,
  ExternalLink,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 20;

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[78vh]">{children}</div>
      </div>
    </div>
  );
};

// ─── Resource Type Config ─────────────────────────────────────────────────────
const RESOURCE_TYPES = [
  { value: "video", label: "Video", Icon: FileVideo, color: "text-purple-500" },
  { value: "pdf", label: "PDF", Icon: FileText, color: "text-amber-500" },
];

const getResourceType = (type) =>
  RESOURCE_TYPES.find((t) => t.value === type) ?? RESOURCE_TYPES[0];

// ─── Resource Row (inside form) ───────────────────────────────────────────────
const ResourceRow = ({ resource, index, onChange, onDelete }) => {
  const { Icon, color } = getResourceType(resource.type);

  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
      {/* Index badge */}
      <div className="shrink-0 w-6 h-6 mt-2 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center select-none">
        {index + 1}
      </div>

      <div className="flex-1 space-y-2">
        {/* Title + Type row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={resource.title}
            onChange={(e) => onChange(index, "title", e.target.value)}
            placeholder="Resource title…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
          <select
            value={resource.type}
            onChange={(e) => onChange(index, "type", e.target.value)}
            className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* URL + open-link button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${color}`}
            />
            <input
              type="url"
              value={resource.file_url}
              onChange={(e) => onChange(index, "file_url", e.target.value)}
              placeholder={
                resource.type === "video"
                  ? "https://… (video URL)"
                  : "https://… (PDF URL)"
              }
              className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
          {/* Open link button */}
          <button
            type="button"
            title="Open link in new tab"
            disabled={!resource.file_url.trim()}
            onClick={() => window.open(resource.file_url, "_blank", "noopener")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ExternalLink size={13} />
            Open
          </button>
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="shrink-0 p-1.5 mt-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Remove resource"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

// ─── Lesson Form (Create & Edit) ──────────────────────────────────────────────
const LessonForm = ({
  initialData = {},
  initialResources = [],
  onSubmit,
  onCancel,
  loading,
  isCreate = false,
  courses = [],
  defaultCourseId = "",
}) => {
  const [form, setForm] = useState({
    course_id: String(initialData.course_id ?? defaultCourseId ?? ""),
    title: initialData.title ?? "",
    sequence: initialData.sequence ?? 1,
  });

  const [resources, setResources] = useState(
    initialResources.map((r) => ({
      id: r.id ?? null,
      title: r.title ?? "",
      type: r.type ?? "video",
      file_url: r.file_url ?? "",
    })),
  );

  const addResource = () =>
    setResources((prev) => [
      ...prev,
      { id: null, title: "", type: "video", file_url: "" },
    ]);

  const updateResource = (index, field, value) =>
    setResources((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );

  const deleteResource = (index) =>
    setResources((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (isCreate && !form.course_id) {
      toast.error("Please select a course");
      return;
    }
    for (const r of resources) {
      if (!r.title.trim()) {
        toast.error("Every resource needs a title");
        return;
      }
      if (!r.file_url.trim()) {
        toast.error("Every resource needs a URL");
        return;
      }
    }

    onSubmit({
      course_id: parseInt(form.course_id),
      title: form.title.trim(),
      sequence: parseInt(form.sequence) || 1,
      resources: resources.map((r, i) => ({ ...r, sequence: i })),
    });
  };

  const base =
    "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Course picker — create only */}
      {isCreate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Course
          </label>
          <div className="relative">
            <BookOpen
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={form.course_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, course_id: e.target.value }))
              }
              className={`${base} pl-9 bg-white`}
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {c.grade ? ` · G${c.grade}` : ""}
                  {c.type ? ` [${c.type.replace(/_/g, " ")}]` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Title + Sequence */}
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Lesson Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Introduction to Algebra"
            className={base}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Order #
          </label>
          <div className="relative">
            <Hash
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="number"
              min="1"
              value={form.sequence}
              onChange={(e) =>
                setForm((p) => ({ ...p, sequence: e.target.value }))
              }
              className={`${base} pl-8`}
            />
          </div>
        </div>
      </div>

      {/* Resources section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Resources</label>
          <span className="text-xs text-gray-400">
            {resources.length} file{resources.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-2">
          {resources.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <Layers size={24} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">No resources yet</p>
              <p className="text-xs mt-0.5 opacity-70">
                Add video or PDF links below
              </p>
            </div>
          )}
          {resources.map((r, i) => (
            <ResourceRow
              key={i}
              resource={r}
              index={i}
              onChange={updateResource}
              onDelete={deleteResource}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addResource}
          className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-dashed border-blue-200 transition-colors"
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>

      {/* Form actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
        >
          {loading
            ? "Processing…"
            : isCreate
              ? "Create Lesson"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fetchJSON = async (url, { method = "GET", body } = {}) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Request failed");
  return data;
};

const ResourceTypeBadge = ({ type }) => {
  const cfg = getResourceType(type);
  const { Icon, color } = cfg;
  const bgMap = {
    video: "bg-purple-100 text-purple-700",
    pdf: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${bgMap[type] ?? "bg-gray-100 text-gray-500"}`}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LessonList = ({ courses = [] }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses[0]?.id ?? "",
  );
  const [lessons, setLessons] = useState([]);
  const [total, setTotal] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const selectedCourse = courses.find(
    (c) => String(c.id) === String(selectedCourseId),
  );

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch lessons
  const loadLessons = useCallback(async () => {
    if (!selectedCourseId) {
      setLessons([]);
      setTotal(0);
      return;
    }
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({
        course_id: selectedCourseId,
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const data = await fetchJSON(`/api/lessons?${params}`);
      setLessons(data.lessons ?? data);
      setTotal(data.total ?? (data.lessons ?? data).length);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load lessons");
    } finally {
      setFetchLoading(false);
    }
  }, [selectedCourseId, page, debouncedSearch]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // CRUD handlers
  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      await toast.promise(
        fetchJSON("/api/lessons", { method: "POST", body: formData }).then(
          (d) => {
            if (
              String(formData.course_id) === String(selectedCourseId) ||
              !selectedCourseId
            ) {
              setSelectedCourseId(String(formData.course_id));
              loadLessons();
            }
            return d;
          },
        ),
        {
          loading: "Creating lesson…",
          success: "Lesson created!",
          error: (e) => e?.message ?? "Failed",
        },
      );
      setCreateModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    setActionLoading(true);
    try {
      await toast.promise(
        fetchJSON(`/api/lessons/${selectedLesson.id}`, {
          method: "PUT",
          body: formData,
        }).then((d) => {
          loadLessons();
          return d;
        }),
        {
          loading: "Updating…",
          success: "Lesson updated!",
          error: (e) => e?.message ?? "Failed",
        },
      );
      setEditModalOpen(false);
      setSelectedLesson(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (lesson) => {
    if (
      !window.confirm(
        `Delete "${lesson.title}" and all its resources? This cannot be undone.`,
      )
    )
      return;

    toast.promise(
      fetchJSON(`/api/lessons/${lesson.id}`, { method: "DELETE" }).then((d) => {
        loadLessons();
        return d;
      }),
      {
        loading: "Deleting lesson…",
        success: "Lesson deleted!",
        error: (e) => e?.message ?? "Failed",
      },
    );
  };

  const openEdit = (lesson, e) => {
    e.stopPropagation();
    setSelectedLesson(lesson);
    setEditModalOpen(true);
  };

  const openDelete = (lesson, e) => {
    e.stopPropagation();
    handleDelete(lesson);
  };

  return (
    <>
      <div className="pt-2 w-full px-4 md:px-8 pb-8">
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Lessons</h1>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              {total}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <SquarePlus size={18} />
              Add Lesson
            </button>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lessons…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Course filter ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <BookOpen
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setPage(1);
                setExpandedId(null);
              }}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none min-w-[240px]"
            >
              <option value="">— Select a course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {c.grade ? ` · G${c.grade}` : ""}
                  {c.type ? ` [${c.type.replace(/_/g, " ")}]` : ""}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <span className="text-xs text-gray-400">
              Showing lessons for{" "}
              <span className="font-semibold text-gray-600">
                {selectedCourse.grade ? `G${selectedCourse.grade}` : ""}{" "}
                {selectedCourse.title}{" "}
                {selectedCourse.type ? `[${selectedCourse.type}]` : ""}
              </span>
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Title", "Resources", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 font-semibold text-gray-600 ${
                        i === 3 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!selectedCourseId ? (
                  <tr>
                    <td colSpan={4} className="text-center py-14 text-gray-400">
                      <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
                      Select a course above to view its lessons.
                    </td>
                  </tr>
                ) : fetchLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Loading lessons…
                      </div>
                    </td>
                  </tr>
                ) : lessons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-14 text-gray-400">
                      No lessons found.
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson) => {
                    const isExpanded = expandedId === lesson.id;
                    const resourceCount = lesson.resources?.length ?? 0;

                    return (
                      <React.Fragment key={lesson.id}>
                        {/* ── Lesson row ── */}
                        <tr
                          className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : lesson.id)
                          }
                        >
                          {/* Sequence */}
                          <td className="px-5 py-3.5 w-14">
                            <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              {lesson.sequence}
                            </span>
                          </td>

                          {/* Title */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {lesson.title}
                              </p>
                              {isExpanded ? (
                                <ChevronUp
                                  size={14}
                                  className="text-gray-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </td>

                          {/* Resource pills */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-gray-400 mr-1">
                                {resourceCount}{" "}
                                {resourceCount === 1 ? "file" : "files"}
                              </span>
                              {lesson.resources?.slice(0, 4).map((r) => (
                                <ResourceTypeBadge key={r.id} type={r.type} />
                              ))}
                              {resourceCount > 4 && (
                                <span className="text-xs text-gray-400">
                                  +{resourceCount - 4}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => openEdit(lesson, e)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={(e) => openDelete(lesson, e)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── Expanded resources ── */}
                        {isExpanded && resourceCount > 0 && (
                          <tr className="bg-blue-50/25">
                            <td />
                            <td colSpan={3} className="px-5 pb-4 pt-2">
                              <div className="space-y-1.5">
                                {lesson.resources.map((r, i) => {
                                  const { Icon, color } = getResourceType(
                                    r.type,
                                  );
                                  return (
                                    <div
                                      key={r.id}
                                      className="flex items-center gap-3 text-xs text-gray-600 group"
                                    >
                                      <span className="w-5 h-5 shrink-0 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-500 text-[10px]">
                                        {i + 1}
                                      </span>
                                      <Icon
                                        size={13}
                                        className={`shrink-0 ${color}`}
                                      />
                                      <span className="font-medium text-gray-700 truncate flex-1">
                                        {r.title}
                                      </span>
                                      <a
                                        href={r.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto flex items-center gap-1 text-blue-500 hover:text-blue-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink size={11} />
                                        Open
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}

                        {isExpanded && resourceCount === 0 && (
                          <tr className="bg-blue-50/20">
                            <td />
                            <td
                              colSpan={3}
                              className="px-5 pb-4 pt-2 text-xs text-gray-400 italic"
                            >
                              No resources attached to this lesson.
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total} lessons
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-1 text-gray-400 text-xs"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                          page === item
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Modal ── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Lesson"
      >
        <LessonForm
          isCreate
          courses={courses}
          defaultCourseId={selectedCourseId}
          onSubmit={handleCreate}
          onCancel={() => setCreateModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedLesson(null);
        }}
        title="Edit Lesson"
      >
        {selectedLesson && (
          <LessonForm
            initialData={selectedLesson}
            initialResources={selectedLesson.resources ?? []}
            courses={courses}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalOpen(false);
              setSelectedLesson(null);
            }}
            loading={actionLoading}
          />
        )}
      </Modal>
    </>
  );
};

export default LessonList;
