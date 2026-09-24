"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from "lucide-react";

import logo from "@/assets/logos/logo_1.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl") || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Signing you in...");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);

        if (res.code === "email_not_verified") {
          toast.error("Please verify your email first.", { id: toastId });
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        if (res.code === "blocked") {
          toast.error("Your account has been blocked. Please contact support.", {
            id: toastId,
          });
        } else {
          toast.error("Invalid email or password.", { id: toastId });
        }
      } else {
        toast.success("Login successful!", { id: toastId });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#071933] flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-[#9fe03c] selection:text-[#0b408e]">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#0b408e]/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#9fe03c]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/30 border border-slate-100 p-8 md:p-10"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-4 inline-block hover:opacity-90 transition">
            <Image src={logo} alt="NexLearn Logo" className="h-auto w-48" priority />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b408e] tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Log in to access your LMS dashboard
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                disabled={loading}
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-xs font-semibold text-[#0b408e] hover:text-[#316ebc] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="block w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 outline-none transition duration-200 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#0b408e] hover:bg-[#093372] text-white font-bold text-sm shadow-lg shadow-[#0b408e]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                <LogIn size={18} />
                <span>LOG IN TO LMS</span>
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Don&apos;t have an LMS account?{" "}
            <Link
              href="/register"
              className="text-[#0b408e] font-bold hover:text-[#316ebc] hover:underline transition"
            >
              Register Now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#071933] flex items-center justify-center text-white">
        Loading LMS login...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
