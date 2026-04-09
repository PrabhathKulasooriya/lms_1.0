"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <div className="bg-[url('@/assets/bg/1.jpg')] bg-cover bg-center text-text  w-screen h-screen flex flex-col justify-center items-center h-full  w-screen ">
      <h1 className=" text-3xl font-semibold  mb-6 w-full text-center">
        Login
      </h1>
      <div className="flex items-center justify-center px-4 max-w-md">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome Back!
            </h2>
          </div>

          <form className="space-y-4 text-zinc-900" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={(e)=> setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none sm:text-sm"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                onChange={(e)=> setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none sm:text-sm"
              />
            </div>

            {/* Submit Button UI */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
              >
                Log In
              </button>
            </div>
          </form>

          <div className="text-center text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-zinc-950">
        {" "}
        Don't have an acoount?
        <Link
          href="/register"
          className="inline-block text-primary  font-bold hover:underline hover:scale-105 origin-center mx-2 transition-all duration-300"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
