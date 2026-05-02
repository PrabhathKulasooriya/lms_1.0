"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SquarePlus,
  Edit,
  CheckCircle,
  XCircle,
  User,
  GraduationCap,
  ChevronDown,
  Trash2,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

// ─── User Search Combobox ─────────────────────────────────────────────────────
const UserSearchCombobox = ({ value, onChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(query)}&limit=8&role=student`,
        );
        const data = await res.json();
        setResults(data.users ?? data ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (user) => {
    setSelected(user);
    setQuery(`${user.first_name} ${user.last_name}`);
    setOpen(false);
    onChange(user.id);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    onChange("");
  };

  return (
    <div ref={containerRef}>
      <div className="relative">
        <User
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) {
              setSelected(null);
              onChange("");
            }
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search by name or email…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin block" />
          ) : selected || query ? (
            <button type="button" onClick={handleClear}>
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          ) : null}
        </div>
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold shrink-0">
            {selected.first_name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {selected.first_name} {selected.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{selected.email}</p>
          </div>
          <CheckCircle size={14} className="text-blue-500 shrink-0 ml-auto" />
        </div>
      )}

      {open && (
        <ul className="mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">
              No users found for "{query}"
            </li>
          ) : (
            results.map((user) => (
              <li
                key={user.id}
                onMouseDown={() => handleSelect(user)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-semibold shrink-0">
                  {user.first_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

// ─── Course type badge helper ─────────────────────────────────────────────────
const COURSE_TYPE_STYLES = {
  theory: "bg-purple-100 text-purple-700",
  past_papers: "bg-amber-100  text-amber-700",
  pastpapers: "bg-amber-100  text-amber-700",
  revision: "bg-teal-100   text-teal-700",
};

// ─── Course grade badge helper ────────────────────────────────────────────────
const CourseGradeBadge = ({ grade }) => {
  if (!grade) return null;
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 leading-tight whitespace-nowrap">
      G{grade}
    </span>
  );
};

const CourseTypeBadge = ({ type }) => {
  if (!type) return null;
  const key = type.toLowerCase().replace(/\s+/g, "_");
  const style = COURSE_TYPE_STYLES[key] ?? "bg-gray-100 text-gray-500";
  const label = type.replace(/_/g, " ");
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize leading-tight ${style}`}
    >
      {label}
    </span>
  );
};

// ─── Course Select ────────────────────────────────────────────────────────────
const CourseSelect = ({ courses, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = courses.find((c) => String(c.id) === String(value));
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.type ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.grade ?? "").toString().includes(search),
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-full flex items-center pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-left"
      >
        <BookOpen
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        {selected ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-gray-900 truncate">{selected.title}</span>
            <CourseGradeBadge grade={selected.grade} />
            <CourseTypeBadge type={selected.type} />
          </div>
        ) : (
          <span className="text-gray-400 flex-1">Select a course…</span>
        )}
        <ChevronDown
          size={14}
          className={`ml-2 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name or type…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
          </div>

          <ul className="max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                No courses match
              </li>
            ) : (
              filtered.map((c) => (
                <li
                  key={c.id}
                  onMouseDown={() => {
                    onChange(c.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                    String(c.id) === String(value)
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen size={13} className="shrink-0 text-blue-400" />
                  <span className="truncate flex-1">{c.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <CourseGradeBadge grade={c.grade} />
                    <CourseTypeBadge type={c.type} />
                  </div>
                  {String(c.id) === String(value) && (
                    <CheckCircle size={13} className="shrink-0 text-blue-500" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Enrollment Form ──────────────────────────────────────────────────────────
const EnrollmentForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading,
  isCreate = false,
  courses = [],
}) => {
  const [form, setForm] = useState({
    userId: "",
    courseId: initialData.course_id ?? "",
    expires_at: initialData.expires_at
      ? new Date(initialData.expires_at).toISOString().slice(0, 10)
      : "",
    is_active: initialData.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCreate && !form.userId) {
      toast.error("Please select a user");
      return;
    }
    if (isCreate && !form.courseId) {
      toast.error("Please select a course");
      return;
    }
    onSubmit({
      ...(isCreate ? { userId: form.userId, courseId: form.courseId } : {}),
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    });
  };

  const inputClass =
    "w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCreate && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Student
            </label>
            <UserSearchCombobox
              value={form.userId}
              onChange={(id) => setForm((p) => ({ ...p, userId: id }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Course
            </label>
            <CourseSelect
              courses={courses}
              value={form.courseId}
              onChange={(id) => setForm((p) => ({ ...p, courseId: id }))}
            />
          </div>
        </>
      )}

      {/* Expire Date */}
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Expires At{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <CalendarClock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) =>
              setForm((p) => ({ ...p, expires_at: e.target.value }))
            }
            className={inputClass}
          />
        </div>
      </div> */}

      {!isCreate && (
        <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            Active Enrollment
          </span>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 ${
              form.is_active ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                form.is_active ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}

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
          {loading ? "Processing…" : isCreate ? "Enroll" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

// ─── Fetch helper ─────────────────────────────────────────────────────────────
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

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const EnrollmentList = ({ courses = [] }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadEnrollments = useCallback(async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const data = await fetchJSON(`/api/enrollment?${params}`);
      const list = data.enrollments ?? data;
      setEnrollments(list);
      setTotal(data.total ?? list.length);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load enrollments");
    } finally {
      setFetchLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      await toast.promise(
        fetchJSON("/api/enrollment", { method: "POST", body: formData }).then(
          (d) => {
            loadEnrollments();
            return d;
          },
        ),
        {
          loading: "Enrolling…",
          success: "Enrollment created!",
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
        fetchJSON(`/api/enrollment/${selectedEnrollment.id}`, {
          method: "PUT",
          body: formData,
        }).then((d) => {
          loadEnrollments();
          return d;
        }),
        {
          loading: "Updating…",
          success: "Updated!",
          error: (e) => e?.message ?? "Failed",
        },
      );
      setEditModalOpen(false);
      setSelectedEnrollment(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = (enrollment) => {
    const action = enrollment.is_active ? "Deactivate" : "Activate";
    if (
      !window.confirm(
        `${action} enrollment for ${enrollment.user?.first_name} in "${enrollment.course?.title}"?`,
      )
    )
      return;
    toast.promise(
      fetchJSON(`/api/enrollment/${enrollment.id}`, {
        method: "PUT",
        body: { is_active: !enrollment.is_active },
      }).then((d) => {
        loadEnrollments();
        return d;
      }),
      {
        loading: `${action}ing…`,
        success: `${action}d!`,
        error: (e) => e?.message ?? "Failed",
      },
    );
  };

  const handleDelete = (enrollment) => {
    if (
      !window.confirm(
        `Remove ${enrollment.user?.first_name} ${enrollment.user?.last_name} from "${enrollment.course?.title}"? This cannot be undone.`,
      )
    )
      return;

    toast.promise(
      fetchJSON(`/api/enrollment/${enrollment.id}`, { method: "DELETE" }).then(
        (d) => {
          loadEnrollments();
          return d;
        },
      ),
      {
        loading: "Deleting enrollment…",
        success: "Enrollment deleted!",
        error: (e) => e?.message ?? "Failed to delete",
      },
    );
  };

  const formatDate = (val) =>
    val
      ? new Date(val).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  const isExpired = (expires_at) =>
    expires_at && new Date(expires_at) < new Date();

  return (
    <>
      <div className="pt-2 w-full px-4 md:px-8 pb-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <GraduationCap size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Enrollments</h1>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              {total}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <SquarePlus size={18} /> Add Enrollment
            </button>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user or course…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setStatusFilter(value);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                statusFilter === value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Student",
                    "Course",
                    "Enrolled At",
                    "Expires At",
                    "Status",
                    "Active",
                    "Tute Sent", // ← new column
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 font-semibold text-gray-600 ${i === 7 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Loading enrollments…
                      </div>
                    </td>
                  </tr>
                ) : enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => {
                    const expired = isExpired(enrollment.expires_at);
                    return (
                      <tr
                        key={enrollment.id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">
                            {enrollment.user?.first_name}{" "}
                            {enrollment.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {enrollment.user?.email}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <BookOpen
                              size={14}
                              className="text-blue-400 shrink-0"
                            />
                            <span className="font-medium text-gray-800">
                              {enrollment.course?.title ??
                                `Course #${enrollment.course_id}`}
                            </span>
                            {enrollment.course?.grade && (
                              <span className="text-xs text-gray-400">
                                G{enrollment.course?.grade}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              ({enrollment.course?.type ?? "Unknown Type"})
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {formatDate(enrollment.enrolled_at) ?? (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          {enrollment.expires_at ? (
                            <span
                              className={
                                expired
                                  ? "text-red-500 font-medium"
                                  : "text-gray-500"
                              }
                            >
                              {formatDate(enrollment.expires_at)}
                            </span>
                          ) : (
                            <span className="text-gray-300">Never</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                              <XCircle size={11} />
                              Expired
                            </span>
                          ) : enrollment.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle size={11} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              <XCircle size={11} />
                              Inactive
                            </span>
                          )}
                        </td>
                        {/* Active toggle */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleActive(enrollment)}
                            className={`relative inline-flex items-center w-16 h-8 rounded-full transition-colors duration-300 ${enrollment.is_active ? "bg-green-500" : "bg-gray-200"}`}
                          >
                            <span
                              className={`absolute text-[10px] font-bold transition-all duration-300 ${enrollment.is_active ? "left-2 text-white" : "right-2 text-gray-400"}`}
                            >
                              {enrollment.is_active ? "YES" : "NO"}
                            </span>
                            <span
                              className={`inline-block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enrollment.is_active ? "translate-x-9" : "translate-x-1"}`}
                            />
                          </button>
                        </td>
                        {/* Tute Sent — read-only badge, managed via Tute Dispatch */}
                        <td className="px-5 py-3.5">
                          {enrollment.tute_sent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle size={11} />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <XCircle size={11} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedEnrollment(enrollment);
                                setEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(enrollment)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total} enrollments
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
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${page === item ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
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

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Enrollment"
      >
        <EnrollmentForm
          isCreate
          courses={courses}
          onSubmit={handleCreate}
          onCancel={() => setCreateModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEnrollment(null);
        }}
        title="Edit Enrollment"
      >
        {selectedEnrollment && (
          <EnrollmentForm
            initialData={selectedEnrollment}
            courses={courses}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalOpen(false);
              setSelectedEnrollment(null);
            }}
            loading={actionLoading}
          />
        )}
      </Modal>
    </>
  );
};

export default EnrollmentList;
