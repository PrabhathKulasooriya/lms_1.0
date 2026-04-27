"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {Eye, EyeOff} from "lucide-react";

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  // Form States
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirm_password: "",
    gender: "",
    mobile: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Start a loading toast that we can update later
    const toastId = toast.loading("Creating your account...");

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
      toast.error("Enter correct mobile number!", { id: toastId });
      setLoading(false);
      return; // Stop execution
    }

    try {
      // 1. Call your registration API
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If API fails, show error and stop
        throw new Error(data.message || "Registration failed");
      }

      // 2. Registration success! Now trigger NextAuth signIn
      toast.loading("Account created! Logging you in...", { id: toastId });

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error(
          "Account created, but automatic login failed. Please login manually.",
          { id: toastId },
        );
        router.push("/login");
      } else {
        toast.success("Welcome aboard! Redirecting...", { id: toastId });

        // 3. 300ms Delay before redirect
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 300);
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[url('@/assets/bg/1.jpg')] bg-cover bg-center w-full overflow-x-hidden pt-12">
      <div className="text-text w-full min-h-dvh flex flex-col justify-center items-center py-10 px-4">
        {/* <h1 className="text-3xl font-bold mb-6 w-full text-center drop-shadow-md  text-primary">
          Register
        </h1> */}

        <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary">
              Welcome Aboard!
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-zinc-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="fname"
                  required
                  disabled={loading}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lname"
                  required
                  disabled={loading}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  required
                  disabled={loading}
                  onChange={handleChange}
                  value={formData.gender}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm bg-white"
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="07XXXXXXXX"
                  required
                  disabled={loading}
                  value={formData.mobile}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    disabled={loading}
                    onChange={handleChange}
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
                {formData.password && formData.password.length < 6 && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    ✗ Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    required
                    disabled={loading}
                    onChange={handleChange}
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
                {formData.confirm_password && (
                  <p
                    className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
                      formData.password === formData.confirm_password
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {formData.password === formData.confirm_password
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}
              </div>
            </div>

            <div className=" text-center">
              <button
                type="submit"
                disabled={loading}
                className="relative inline-flex items-center justify-center px-8 py-2.5 w-full overflow-hidden tracking-tighter text-white bg-[#0b408e] rounded-md group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-blue-700 rounded-full group-hover:w-full group-hover:h-56"></span>
                <span className="absolute bottom-0 left-0 h-full -ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-auto h-full opacity-100 object-stretch"
                    viewBox="0 0 487 487"
                  >
                    <path
                      fillOpacity=".1"
                      fillRule="nonzero"
                      fill="#FFF"
                      d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
                    ></path>
                  </svg>
                </span>
                <span className="absolute top-0 right-0 w-12 h-full -mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="object-cover w-full h-full"
                    viewBox="0 0 487 487"
                  >
                    <path
                      fillOpacity=".1"
                      fillRule="nonzero"
                      fill="#FFF"
                      d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
                    ></path>
                  </svg>
                </span>
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200"></span>
                <span className="relative text-base font-semibold">
                  {loading ? "Creating Account..." : "REGISTER"}
                </span>
              </button>
            </div>
          </form>

          <div className="text-center text-sm">
            <Link
              href="/forgot-password"
              size="sm"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-text">
          Already have an account?
          <Link
            href="/login"
            className="text-primary font-bold hover:underline mx-2"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
