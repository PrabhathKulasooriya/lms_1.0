"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast"; 


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl") || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, 
    });

    if (res?.error) {
      toast.error("Invalid credentials!");
      setLoading(false);
    } else {
      toast.success("Login successful!");
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="bg-[url('@/assets/bg/1.jpg')] bg-cover bg-center text-text w-screen h-screen flex flex-col justify-center items-center">
      {/* <h1 className="text-3xl font-semibold mb-6 w-full text-center">Login</h1> */}
      <div className="flex items-center justify-center px-4 max-w-md">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary">
              Welcome Back!
            </h2>
          </div>

          <form className="space-y-4 text-zinc-900" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none sm:text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-blue-400"
              >
                {loading ? "Authenticating..." : "Log In"}
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
        Don't have an account?
        <Link
          href="/register"
          className="inline-block text-primary font-bold hover:underline hover:scale-105 origin-center mx-2 transition-all duration-300"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
