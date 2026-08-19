"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { sendPasswordReset, getFirebaseAuthErrorMessage } from "@/lib/authProviders";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await sendPasswordReset(cleanEmail);
      setSuccess(true);
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Logo */}
        <Link href="/" className="inline-block text-2xl font-black tracking-tight text-gray-900">
          AItool<span className="text-blue-600">Hub</span>
        </Link>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 mt-6">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we&apos;ll send you instructions to reset your password.
        </p>

        {success ? (
          <div className="mt-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Check your inbox</h2>
              <p className="text-sm text-gray-600 mt-1">
                We sent a password reset link to <strong className="text-gray-900">{email}</strong>.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full mt-4 rounded-xl bg-blue-600 py-3.5 px-4 text-white font-semibold hover:bg-blue-700 transition"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 mt-6" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-blue-600 py-3.5 px-4 text-white font-semibold hover:bg-blue-700 transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
