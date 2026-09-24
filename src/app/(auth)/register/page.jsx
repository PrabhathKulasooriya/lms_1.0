"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import logo from "@/assets/logos/logo_1.png";

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirm_password: "",
    gender: "",
    mobile: "",
    address: "",
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "mobile") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
      }
    } else {
      const finalValue = type === "checkbox" ? checked : value;
      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Creating your LMS account...");

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!", { id: toastId });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!", { id: toastId });
      setLoading(false);
      return;
    }

    const mobilePattern = /^07\d{8}$/;
    if (!mobilePattern.test(formData.mobile)) {
      toast.error("Enter correct mobile number (07XXXXXXXX)!", { id: toastId });
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("You must agree to the Terms and Conditions!", { id: toastId });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.fname,
          last_name: formData.lname,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          mobile: formData.mobile,
          address: formData.address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! Please verify your email.", {
        id: toastId,
      });
      setTimeout(() => {
        router.push(
          `/verify-email?email=${encodeURIComponent(formData.email)}`
        );
      }, 300);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#071933] flex flex-col justify-center items-center px-4 py-12 overflow-x-hidden selection:bg-[#9fe03c] selection:text-[#0b408e]">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#0b408e]/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#9fe03c]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-black/30 border border-slate-100 p-8 md:p-10 my-6"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-4 inline-block hover:opacity-90 transition">
            <Image src={logo} alt="NexLearn Logo" className="h-auto w-48" priority />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b408e] tracking-tight">
            Create Your Student Account
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Join NexLearn today to start mastering O/L Commerce
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="fname"
                  required
                  value={formData.fname}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="Isuru"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="lname"
                  required
                  value={formData.lname}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="Prabhath"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Home Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Home Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="Main Street, Colombo"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                required
                disabled={loading}
                onChange={handleChange}
                value={formData.gender}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="07XXXXXXXX"
                  required
                  disabled={loading}
                  value={formData.mobile}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.password && formData.password.length < 6 && (
                <p className="mt-1 text-xs font-medium text-amber-600 flex items-center gap-1">
                  <AlertCircle size={13} />
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.confirm_password && (
                <p
                  className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                    formData.password === formData.confirm_password
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {formData.password === formData.confirm_password ? (
                    <>
                      <CheckCircle2 size={13} />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} />
                      Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              required
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b408e] focus:ring-[#0b408e] cursor-pointer"
            />
            <label
              htmlFor="agreeToTerms"
              className="text-xs text-slate-600 leading-snug cursor-pointer"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-[#0b408e] font-bold hover:underline"
              >
                Terms and Conditions
              </Link>{" "}
              and acknowledge the Privacy Policy.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#0b408e] hover:bg-[#093372] text-white font-bold text-sm shadow-lg shadow-[#0b408e]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>CREATE ACCOUNT</span>
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#0b408e] font-bold hover:text-[#316ebc] hover:underline transition"
            >
              Login Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
