"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const router = useRouter();
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
    const { name, value } = e.target;

    if (name === "mobile") {
      
      const numbersOnly = value.replace(/\D/g, "");
      if(numbersOnly.length <= 10){
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
                <input
                  type="password"
                  name="password"
                  required
                  disabled={loading}
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
