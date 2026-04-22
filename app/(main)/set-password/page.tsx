"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/firebase";
import { linkEmailPassword } from "@/lib/authProviders";

export default function SetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState(auth.currentUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await linkEmailPassword(email, password);

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      if (err.code === "auth/credential-already-in-use") {
        setError(
          "This email already has a password. Try signing in with email instead."
        );
      } else {
        setError("Failed to set password. Please try again.");
      }
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
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Set a password
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Add a password so you can sign in with email next time.
        </p>

        {/* Email (read-only) */}
        <input
          type="email"
          value={email}
          disabled
          className="w-full mt-6 border rounded-xl px-4 py-3 bg-gray-100 text-gray-600"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="New password"
          className="w-full mt-4 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full mt-4 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* Success */}
        {success && (
          <p className="text-green-600 text-sm mt-4">
            ✅ Password set successfully! Redirecting…
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleSetPassword}
          disabled={loading}
          className="w-full mt-6 rounded-xl bg-blue-500 py-3 text-white font-semibold hover:bg-blue-600 transition"
        >
          {loading ? "Saving..." : "Set Password"}
        </button>

        {/* Back */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Changed your mind?{" "}
          <Link
            href="/dashboard"
            className="text-blue-500 hover:underline font-medium"
          >
            Go back
          </Link>
        </p>
      </div>
    </main>
  );
}