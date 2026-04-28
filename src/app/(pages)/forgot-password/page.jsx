"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {Eye, EyeOff} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize email from URL if it exists
  const initialEmail = searchParams.get("email") || "";

  // UI Flow State: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const inputRefs = useRef([]);

  // --- STEP 1: Send the Code ---
  const handleSendCode = async (e) => {
    e?.preventDefault();
    if (!email) return toast.error("Please enter your email.");

    setLoading(true);
    const toastId = toast.loading("Sending code...");
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "PASSWORD_RESET" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Code sent to your email!", { id: toastId });
      setStep(2); // Move to OTP step
    } catch (err) {
      toast.error(err.message || "Failed to send code.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Input Handlers ---
  const handleOtpInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    // Prevent the default paste behavior
    e.preventDefault();

    // Get the pasted text, strip out any non-numbers, and grab the first 6
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    // If we have exactly 6 digits, fill the boxes and focus the last one
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // --- STEP 2: Verify the Code ---
  const handleVerifyCode = async () => {
    const code = otp.join("");
    if (code.length < 6) return toast.error("Enter the full 6-digit code.");

    setLoading(true);
    const toastId = toast.loading("Verifying...");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, type: "PASSWORD_RESET" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Code verified!", { id: toastId });
      setStep(3); // Move to Password step
    } catch (err) {
      toast.error(err.message || "Invalid code.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: Save New Password ---
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("Passwords do not match.");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    const toastId = toast.loading("Saving new password...");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join(""), // Pass the verified OTP to authorize the change
          newPassword: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Password updated! Logging you in...", { id: toastId });
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      toast.error(err.message || "Failed to save password.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-zinc-900">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">
        {/* Header changes based on step */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-primary">
            {step === 1 && "Reset Password"}
            {step === 2 && "Enter Code"}
            {step === 3 && "New Password"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {step === 1 && "Enter your email to receive a verification code."}
            {step === 2 && `We sent a 6-digit code to ${email}`}
            {step === 3 && "Please create a secure new password."}
          </p>
        </div>

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="block w-full px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0b408e] text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Get Verification Code"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP INPUT */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Add onPaste={handlePaste} right here! 👇 */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading}
                  className="w-11 h-14 text-center text-xl font-bold border-2 rounded-lg border-gray-300 focus:border-blue-500 outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={loading || otp.join("").length < 6}
              className="w-full py-3 bg-[#0b408e] text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <div className="text-center">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:underline"
              >
                Wrong email? Go back
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: NEW PASSWORD INPUT */}
        {step === 3 && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="block w-full px-4 py-3 pr-10 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && password.length < 6 && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  ✗ Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="block w-full px-4 py-3 pr-10 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <p
                  className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
                    password === confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              // Extra UX trick: Disable button if rules aren't met yet
              disabled={
                loading || password.length < 6 || password !== confirmPassword
              }
              className="w-full py-3 bg-[#0b408e] text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
