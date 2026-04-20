"use client";
import React, { useState } from "react";
import {
  Trash2,
  Edit,
  Search,
  GraduationCap,
  Plus,
  X,
  BookOpen,
  DollarSign,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// ─── Reusable Modal Shell ────────────────────────────────────────────────────
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
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Shared Course Form ──────────────────────────────────────────────────────
const CourseForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  loading,
}) => {
  const [form, setForm] = useState({
    title: initialData.title ?? "",
    grade: initialData.grade ?? "",
    price: initialData.price ?? "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.grade || form.price === "") {
      toast.error("All fields are required");
      return;
    }
    onSubmit({
      title: form.title.trim(),
      grade: Number(form.grade),
      price: Number(form.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Course Title
        </label>
        <div className="relative">
          <BookOpen
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Mathematics"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Grade + Price row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Grade
          </label>
          <div className="relative">
            <Hash
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="grade"
              type="number"
              min="1"
              value={form.grade}
              onChange={handleChange}
              placeholder="e.g. 10"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Price (LKR)
          </label>
          <div className="relative">
            <DollarSign
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
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
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CourseList = ({ initialCourses }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Loading flags
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // ── Filtered + sorted list ──────────────────────────────────────────────
  const filteredCourses = initialCourses
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade.toString().includes(searchTerm),
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // ── Handlers ────────────────────────────────────────────────────────────
  const openEdit = (course) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?",
    );
    if (!confirmed) return;

    toast.promise(
      fetch("/api/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        router.refresh();
        return res;
      }),
      {
        loading: "Deleting…",
        success: "Course removed!",
        error: (err) => err?.message ?? "Failed to delete",
      },
    );
  };

  const handleAdd = async (formData) => {
    setAddLoading(true);
    try {
      await toast.promise(
        fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to create");
          router.refresh();
          return res;
        }),
        {
          loading: "Creating course…",
          success: "Course created!",
          error: (err) => err?.message ?? "Failed to create",
        },
      );
      setAddModalOpen(false);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    setEditLoading(true);
    try {
      await toast.promise(
        fetch("/api/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedCourse.id, ...formData }),
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to update");
          router.refresh();
          return res;
        }),
        {
          loading: "Updating course…",
          success: "Course updated!",
          error: (err) => err?.message ?? "Failed to update",
        },
      );
      setEditModalOpen(false);
      setSelectedCourse(null);
    } finally {
      setEditLoading(false);
    }
  };

  const handleTogglePublish = (course) => {
    toast.promise(
      fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: course.id,
          is_published: !course.is_published,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        router.refresh();
        return res;
      }),
      {
        loading: "Updating status…",
        success: `Course ${!course.is_published ? "published" : "unpublished"}!`,
        error: (err) => err?.message ?? "Failed to update",
      },
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pt-20 w-full px-4 md:px-8 pb-8">
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Heading */}
          <div className="flex items-center gap-2">
            <GraduationCap size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Courses</h1>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              {filteredCourses.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or grade…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Add button */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Course
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Title
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Grade
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Price
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Publish
                  </th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {course.title}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        Grade {course.grade}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        LKR {Number(course.price).toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleTogglePublish(course)}
                          className={`relative inline-flex items-center w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
                            course.is_published
                              ? "bg-purple-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute text-[10px] font-bold transition-all duration-300 ${
                              course.is_published
                                ? "left-2.5 text-white"
                                : "right-2 text-gray-400"
                            }`}
                          >
                            {course.is_published ? "YES" : "NO"}
                          </span>
                          <span
                            className={`inline-block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              course.is_published
                                ? "translate-x-9"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(course)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add Modal ── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Course"
      >
        <CourseForm
          onSubmit={handleAdd}
          onCancel={() => setAddModalOpen(false)}
          submitLabel="Create Course"
          loading={addLoading}
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCourse(null);
        }}
        title="Edit Course"
      >
        {selectedCourse && (
          <CourseForm
            initialData={selectedCourse}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalOpen(false);
              setSelectedCourse(null);
            }}
            submitLabel="Save Changes"
            loading={editLoading}
          />
        )}
      </Modal>
    </>
  );
};

export default CourseList;
