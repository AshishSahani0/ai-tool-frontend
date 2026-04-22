"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ Reset Password Handler
  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await sendPasswordResetEmail(auth, email);

      setMessage("✅ Password reset link sent to your email!");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError("❌ Failed to send reset link. Check your email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* ✅ Logo */}
        <h2 className="text-2xl font-bold text-gray-900">
          AItoolHub
        </h2>

        {/* ✅ Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mt-6">
          Lost password
        </h1>

        <p className="mt-2 text-gray-600">
          Enter your email and we will send you a reset link.
        </p>

        {/* ✅ Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mt-8 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ✅ Messages */}
        {message && (
          <p className="text-green-600 text-sm mt-4">{message}</p>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        {/* ✅ Reset Button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full mt-6 rounded-xl bg-blue-500 py-3 text-white font-semibold hover:bg-blue-600 transition"
        >
          {loading ? "Sending..." : "Reset password"}
        </button>

        {/* ✅ Back to Login */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
