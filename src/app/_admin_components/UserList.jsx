"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Edit,
  Search,
  Users,
  X,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  SquarePlus,
  MapPin,
  Eye,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 20;

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

// ─── View Details Component ──────────────────────────────────────────────────
const ViewDetails = ({ user }) => {
  const Item = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="mt-1 text-blue-600">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Item icon={User} label="First Name" value={user.first_name} />
        <Item icon={User} label="Last Name" value={user.last_name} />
      </div>
      <Item icon={Mail} label="Email Address" value={user.email} />
      <Item icon={MapPin} label="Home Address" value={user.address} />
      <div className="grid grid-cols-2 gap-3">
        <Item icon={Phone} label="Mobile" value={user.mobile} />
        <Item icon={Users} label="Role" value={user.role} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Item icon={User} label="Gender" value={user.gender} />
        <Item
          icon={Calendar}
          label="Joined"
          value={new Date(user.created_at).toLocaleDateString()}
        />
      </div>
    </div>
  );
};

// ─── User Form (Handles Create & Edit) ───────────────────────────────────────
const UserForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading,
  isCreate = false,
}) => {
  const [form, setForm] = useState({
    first_name: initialData.first_name ?? "",
    last_name: initialData.last_name ?? "",
    email: initialData.email ?? "",
    password: "",
    mobile: initialData.mobile ?? "",
    gender: initialData.gender ?? "",
    role: initialData.role ?? "student",
    address: initialData.address ?? "", // Added address
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.email.trim() ||
      !form.address.trim() || // Validate address
      (isCreate && !form.password)
    ) {
      toast.error("Required fields are missing");
      return;
    }
    if (isCreate && form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.mobile && !/^07\d{8}$/.test(form.mobile)) {
      toast.error("Mobile must be 10 digits starting with 07");
      return;
    }

    onSubmit({
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      mobile: form.mobile.trim() || undefined,
    });
  };

  const inputClass =
    "w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            First Name
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Last Name
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Doe"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={!isCreate}
          placeholder="email@example.com"
          className={inputClass + " pl-4"}
        />
      </div>

      {isCreate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={inputClass + " pl-4"}
          />
        </div>
      )}

      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Address
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Home Address"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mobile
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="07XXXXXXXX"
              maxLength={10}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Gender
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["male", "female", "other"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, gender: g }))}
              className={`py-2.5 text-sm font-medium rounded-xl border capitalize transition-all ${
                form.gender === g
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

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
          {loading ? "Processing…" : isCreate ? "Create User" : "Save Changes"}
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

// ─── Role Filter Tabs ─────────────────────────────────────────────────────────
const ROLE_FILTERS = [
  { label: "All", value: "all", icon: Users },
  { label: "Students", value: "student", icon: GraduationCap },
  { label: "Admins", value: "admin", icon: ShieldCheck },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const UserList = () => {
  const router = useRouter();

  // Data
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("student");
  const [page, setPage] = useState(1);

  // Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false); // View Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch users ────────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      });
      const data = await fetchJSON(`/api/users?${params}`);
      setUsers(data.users ?? data);
      setTotal(data.total ?? data.length);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load users");
    } finally {
      setFetchLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      await toast.promise(
        fetchJSON(`/api/users`, { method: "POST", body: formData }).then(
          (data) => {
            loadUsers();
            return data;
          },
        ),
        {
          loading: "Creating user…",
          success: "User created successfully!",
          error: (err) => err?.message ?? "Failed to create user",
        },
      );
      setCreateModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const openView = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEdit = async (formData) => {
    setActionLoading(true);
    try {
      await toast.promise(
        fetchJSON(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          body: formData,
        }).then((data) => {
          loadUsers();
          return data;
        }),
        {
          loading: "Updating user…",
          success: "User updated!",
          error: (err) => err?.message ?? "Failed to update",
        },
      );
      setEditModalOpen(false);
      setSelectedUser(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = (user) => {
    const action = user.is_blocked ? "Unblock" : "Block";
    if (!window.confirm(`${action} ${user.first_name} ${user.last_name}?`))
      return;

    toast.promise(
      fetchJSON(`/api/users/${user.id}`, {
        method: "PUT",
        body: { is_blocked: !user.is_blocked },
      }).then((data) => {
        loadUsers();
        return data;
      }),
      {
        loading: `${action}ing user…`,
        success: `User ${action.toLowerCase()}ed!`,
        error: (err) => err?.message ?? `Failed to ${action.toLowerCase()}`,
      },
    );
  };

  return (
    <>
      <div className="pt-2 w-full px-4 md:px-8 pb-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              {total}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <SquarePlus size={18} /> Add User
            </button>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {ROLE_FILTERS.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleRoleFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border transition-all ${roleFilter === value ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    User
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Mobile
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Verified
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Blocked
                  </th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Loading users…
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {user.mobile ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {user.role ?? "student"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_email_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {user.is_email_verified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`relative inline-flex items-center w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${user.is_blocked ? "bg-red-500" : "bg-gray-200"}`}
                        >
                          <span
                            className={`absolute text-[10px] font-bold transition-all duration-300 ${user.is_blocked ? "left-2 text-white" : "right-2 text-gray-400"}`}
                          >
                            {user.is_blocked ? "YES" : "NO"}
                          </span>
                          <span
                            className={`inline-block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${user.is_blocked ? "translate-x-9" : "translate-x-1"}`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openView(user)}
                            className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total} users
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
                        key={`ellipsis-${idx}`}
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

      {/* ── Create Modal ── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New User"
      >
        <UserForm
          isCreate={true}
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
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        {selectedUser && (
          <UserForm
            initialData={selectedUser}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalOpen(false);
              setSelectedUser(null);
            }}
            loading={actionLoading}
          />
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && <ViewDetails user={selectedUser} />}
      </Modal>
    </>
  );
};

export default UserList;
