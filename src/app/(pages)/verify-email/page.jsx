"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "EMAIL_VERIFICATION";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const hasRequested = useRef(false);

  // Send OTP automatically on first mount
  useEffect(() => {
    if (email && !hasRequested.current){
      hasRequested.current = true;
      sendOtp(true);
    } 
  }, [email]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendOtp = async (silent = false) => {
    if (!email) return;
    setSending(true);
    const toastId = silent ? null : toast.loading("Sending new code...");
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      if (!silent) toast.success("New code sent!", { id: toastId });
      else toast.success("Verification code sent to your email.");
      setCountdown(60); // 60-second resend cooldown
    } catch (err) {
      const msg = err.message || "Failed to send code.";
      silent ? toast.error(msg) : toast.error(msg, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const handleInput = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Verifying...");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message , { id: toastId });

      setTimeout(() =>{ if (type === "PASSWORD_RESET") {
          // Pass the OTP in the URL so the next page can use it to actually save the new password
          router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
            } else {
              router.push("/login");
            }
        }, 1500);
    } catch (err) {
      toast.error(err.message || "Verification failed.", { id: toastId });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          No email provided. Please register first.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="w-11 h-14 text-center text-xl font-bold border-2 rounded-lg
                         border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         outline-none transition disabled:opacity-50"
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length < 6}
          className="w-full py-3 bg-[#0b408e] text-white font-semibold rounded-lg
                     hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {/* Resend */}
        <p className="text-sm text-gray-500">
          Didn&apos;t receive it?{" "}
          {countdown > 0 ? (
            <span className="text-gray-400">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={() => sendOtp(false)}
              disabled={sending}
              className="text-blue-600 font-medium hover:underline disabled:opacity-50"
            >
              {sending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
