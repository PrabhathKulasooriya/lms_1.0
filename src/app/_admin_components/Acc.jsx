"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  User,
  CalendarDays,
  Pencil,
  X,
  KeyRound,
  Clock4,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  MapPin,
  ShieldCheck,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Badge Component ──────────────────────────────────────────────
const Badge = ({ label, active, variant = "gold" }) => {
  const variants = {
    green: active
      ? "bg-[#9fe03c]/20 text-[#0b408e] ring-[#9fe03c]/50"
      : "bg-slate-100 text-slate-400 ring-slate-200",
    blue: active
      ? "bg-[#0b408e]/10 text-[#0b408e] ring-[#0b408e]/20"
      : "bg-slate-100 text-slate-400 ring-slate-200",
    gold: "bg-[#FFD700]/20 text-[#8e7300] ring-[#FFD700]/50 font-bold",
    red: "bg-red-50 text-red-500 ring-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ring-1 uppercase tracking-wider ${variants[variant]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active || variant === "gold" ? "bg-current" : "bg-slate-300"}`}
      />
      {label}
    </span>
  );
};

// ── Field Component ──────────────────────────────────────────────
const Field = ({ icon: IconComp, label, value }) => (
  <div className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#0b408e]/30 hover:shadow-md">
    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0b408e] group-hover:bg-[#0b408e] group-hover:text-white transition-colors duration-300 shrink-0">
      <IconComp size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  </div>
);

// ── Input Component ──────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
    <input
      {...props}
      className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20"
    />
  </div>
);

// ── Edit Profile Modal ───────────────────────────────────────────
const EditModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    mobile: user.mobile || "",
    gender: user.gender || "",
    address: user.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Update failed");
      onSave(data.user);
      onClose();
      toast.success("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0b408e] via-[#FFD700] to-[#9fe03c]" />

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Pencil size={18} className="text-[#0b408e]" />
            <h2 className="font-bold text-slate-800">Edit Profile Details</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-500 border border-red-100">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Home Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="123 Street, City"
            required
          />

          <Input
            label="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="07XXXXXXXX"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#0b408e] py-3 text-xs font-bold text-white shadow-md shadow-[#0b408e]/20 transition hover:bg-[#093372] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Password Input Component ──────────────────────────────────────
const PasswordInput = ({ label, name, value, onChange, show, onToggle }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder="••••••••"
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b408e] transition"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

// ── Change Password Modal ─────────────────────────────────────────
const ChangePasswordModal = ({ userId, onClose }) => {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.new_password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    if (form.current_password === form.new_password) {
      setError("New password must differ from the current password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Password change failed");
      toast.success("Password changed successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0b408e] via-[#FFD700] to-[#9fe03c]" />

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-[#0b408e]" />
            <h2 className="font-bold text-slate-800">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-500 border border-red-100">
              {error}
            </p>
          )}

          <PasswordInput
            label="Current Password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
          />

          <div className="h-px bg-slate-100" />

          <PasswordInput
            label="New Password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#0b408e] py-3 text-xs font-bold text-white shadow-md shadow-[#0b408e]/20 transition hover:bg-[#093372] disabled:opacity-60"
            >
              {loading ? "Updating…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Account Component ───────────────────────────────────────
const Acc = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const lastUpdated = user.updated_at
    ? new Date(user.updated_at).toLocaleDateString()
    : "—";

  return (
    <>
      {modalOpen && (
        <EditModal
          user={user}
          onClose={() => setModalOpen(false)}
          onSave={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {pwModalOpen && (
        <ChangePasswordModal
          userId={user.id}
          onClose={() => setPwModalOpen(false)}
        />
      )}

      <div className="w-full">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="relative h-36 md:h-44 bg-gradient-to-r from-[#071933] via-[#0b408e] to-[#071933] p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#9fe03c]/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9fe03c] via-[#FFD700] to-transparent" />
          </div>

          {/* Profile Header Row */}
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 md:-mt-20 gap-4 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
                {/* Avatar Box */}
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-[#FFD700] border-4 border-white shadow-xl flex items-center justify-center text-3xl md:text-4xl font-black text-[#0b408e]">
                    {initials}
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#9fe03c] border-2 border-white" />
                </div>

                {/* User Info */}
                <div className="pb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="pb-1">
                <Badge label={user.role ?? "student"} active variant="gold" />
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Field icon={Mail} label="Email Address" value={user.email} />
              <Field icon={Phone} label="Mobile Phone" value={user.mobile} />
              <Field icon={MapPin} label="Home Address" value={user.address} />
              <Field
                icon={User}
                label="Gender"
                value={
                  user.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : null
                }
              />
              {joinDate && (
                <Field
                  icon={CalendarDays}
                  label="Member Since"
                  value={joinDate}
                />
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Clock4 size={14} />
                <span>Last updated {lastUpdated}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setPwModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-[#0b408e] transition-all duration-200"
                >
                  <KeyRound size={15} />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b408e] text-white text-xs font-bold hover:bg-[#093372] transition-all duration-200 shadow-md shadow-[#0b408e]/20"
                >
                  <Pencil size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Acc;