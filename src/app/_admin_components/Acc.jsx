"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  User,
  CalendarDays,
  Pencil,
  X,
  Hash,
  Clock4,
} from "lucide-react";

// ── Badge ──────────────────────────────────────────────────────
const Badge = ({ label, active, variant = "green" }) => {
  const variants = {
    green: active
      ? "bg-[#9fe03c]/15 text-[#5a8a1a] ring-[#9fe03c]/40"
      : "bg-gray-100 text-gray-400 ring-gray-200",
    blue: active
      ? "bg-[#0b408e]/10 text-[#0b408e] ring-[#0b408e]/20"
      : "bg-gray-100 text-gray-400 ring-gray-200",
    gold: "bg-[#FFD700]/20 text-[#9a7c00] ring-[#FFD700]/40",
    red: "bg-red-50 text-red-500 ring-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${variants[variant]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active || variant === "gold" ? "bg-current" : "bg-gray-300"}`}
      />
      {label}
    </span>
  );
};

// ── Info Field ─────────────────────────────────────────────────
const Field = ({ icon: IconComp, label, value }) => (
  <div className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition hover:border-[#0b408e]/20 hover:shadow-md">
    <span className="mt-0.5 text-[#0b408e]/50 transition group-hover:text-[#0b408e]">
      <IconComp size={16} strokeWidth={1.8} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-[#2D3436]">
        {value || "—"}
      </p>
    </div>
  </div>
);

// ── Input ──────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#2D3436]/60">{label}</label>
    <input
      {...props}
      className="rounded-lg border border-gray-200 bg-[#F8F9FA] px-3 py-2.5 text-sm text-[#2D3436] placeholder-gray-300 outline-none transition focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/10"
    />
  </div>
);

// ── Edit Modal ─────────────────────────────────────────────────
const EditModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    mobile: user.mobile || "",
    gender: user.gender || "",
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* top accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0b408e] via-[#FFD700] to-[#9fe03c]" />

        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-[#0b408e]" />
            <h2 className="font-bold text-[#2D3436]">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#F8F9FA] hover:text-[#2D3436]"
          >
            <X size={16} />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-500 ring-1 ring-red-100">
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
            label="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="07XXXXXXXX"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#2D3436]/60">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="rounded-lg border border-gray-200 bg-[#F8F9FA] px-3 py-2.5 text-sm text-[#2D3436] outline-none transition focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/10"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-[#2D3436]/70 transition hover:bg-[#F8F9FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#0b408e] py-2.5 text-sm font-bold text-white shadow-md shadow-[#0b408e]/20 transition hover:bg-[#0a3578] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Account Component ─────────────────────────────────────
const Acc = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [modalOpen, setModalOpen] = useState(false);

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

      <div className="flex flex-col w-full h-full">
          {/* ── card ── */}
          <div className="overflow-hidden h-full bg-white shadow-xl ring-1 ring-gray-100">

            {/* banner */}
            <div className="relative h-28 bg-[#0b408e] sm:h-36">
              <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-[#FFD700]/20" />
              <div className="absolute right-16 bottom-0 h-20 w-20 rounded-full bg-[#9fe03c]/15" />
              <div className="absolute left-1/3 top-4 h-10 w-10 rounded-full bg-white/5" />
              {/* gold bottom stripe */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#FFD700] via-[#9fe03c] to-transparent opacity-70" />
            </div>

            {/* avatar + title row */}
            <div className="-mt-15 md:-mt-18  flex flex-col md:flex-row items-center md:items-end  p-2 md:p-4 ">
              
              {/* avatar */}
              <div className="relative ">
                <div className="flex h-25 w-25 md:h-35 md:w-35 items-center justify-center rounded-2xl border-[3px] border-white bg-[#FFD700] text-4xl  font-extrabold text-[#0b408e] shadow-lg ">
                  {initials}
                </div>
                {/* online dot */}
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#9fe03c]" />
              </div>

              {/* name / email / role */}
              <div className="flex flex-1 flex-col justify-center items-center gap-1 mt-2  p-2 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
                <div className="flex flex-col md:items-start items-center">
                  <h1 className="text-xl font-extrabold leading-tight text-[#2D3436] sm:text-2xl">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <Badge label={user.role ?? "student"} active variant="gold" />
              </div>
            </div>

            {/* ── body ── */}
            <div className="space-y-6 px-5 py-6 sm:px-8 flex flex-col items-center">

              {/* verification badges */}
              {/* <div className="flex flex-wrap gap-2">
                <Badge
                  label={user.is_email_verified ? "Email Verified" : "Email Unverified"}
                  active={user.is_email_verified}
                  variant="green"
                />
                <Badge
                  label={user.is_mobile_verified ? "Mobile Verified" : "Mobile Unverified"}
                  active={user.is_mobile_verified}
                  variant="blue"
                />
                {user.is_blocked && (
                  <Badge label="Account Blocked" variant="red" />
                )}
              </div> */}

              {/* divider */}
              <div className="h-px bg-gradient-to-r from-[#0b408e]/10 via-[#FFD700]/40 to-transparent" />

              {/* info grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:w-2/3 ">
                <Field icon={Mail} label="Email Address" value={user.email} />
                <Field icon={Phone} label="Mobile" value={user.mobile} />
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
                  <Field icon={CalendarDays} label="Member Since" value={joinDate} />
                )}
              </div>

              {/* footer row */}
              <div className="flex flex-col items-start w-full justify-between gap-3 sm:flex-row sm:items-center">
                {/* meta info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  
                  <span className="flex items-center gap-1">
                    <Clock4 size={12} />
                    Updated {lastUpdated}
                  </span>
                </div>

                {/* edit button */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#0b408e] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0b408e]/20 transition hover:bg-[#0a3578] active:scale-[0.97]"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        
      </div>
    </>
  );
};

export default Acc;