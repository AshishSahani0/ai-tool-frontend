"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  loginWithGoogle,
  loginWithEmail,
  linkGoogleProvider,
} from "@/lib/authProviders";

import { syncUserWithBackend } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await loginWithGoogle();
      await syncUserWithBackend();
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "NEEDS_PASSWORD_LOGIN") {
        // Redirect user to email login with hint
        router.push(
          `/login?email=${encodeURIComponent(err.email)}&linkGoogle=true`,
        );
        return;
      }

      setError("Google login failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Email / Password Login
  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await loginWithEmail(email, password);

      // 🔥 If user came from Google linking flow
      const params = new URLSearchParams(window.location.search);
      if (params.get("linkGoogle") === "true") {
        await linkGoogleProvider();
      }

      await syncUserWithBackend();
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <h2 className="text-2xl font-bold text-gray-900">AItoolHub</h2>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mt-6">Sign In</h1>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-8 flex items-center justify-center gap-3 border rounded-xl py-3 text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">Or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email / Password */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Forgot password */}
        <div className="text-right mt-3">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-black"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* Sign In Button */}
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full mt-6 rounded-xl bg-blue-500 py-3 text-white font-semibold hover:bg-blue-600 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Signup */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need an account?{" "}
          <Link
            href="/signup"
            className="text-blue-500 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
