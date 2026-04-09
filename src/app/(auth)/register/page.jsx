"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    gender: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call your registration API
      const res = await fetch("/api/users/create", {
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
        throw new Error(data.message || "Registration failed");
      }

      // 2. Registration success! Now trigger NextAuth signIn
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false, // Handle redirect manually to check for errors
      });

      if (signInResult?.error) {
        setError("Account created, but failed to log in automatically.");
      } else {
        router.push("/"); // Success redirect
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[url('@/assets/bg/1.jpg')] bg-cover bg-center w-full overflow-x-hidden pt-12">
      <div className="text-text w-full min-h-dvh flex flex-col justify-center items-center py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 w-full text-center drop-shadow-md">
          Register
        </h1>

        <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Welcome Aboard!
            </h2>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
                  required
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
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? "Creating Account..." : "Sign Up"}
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

        <p className="mt-4 text-center ">
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
