"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Google Signup
  const signupWithGoogle = async () => {
    try {
      setLoading(true);
      setError("");

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      router.push("/dashboard");
    } catch (err) {
      setError("Google signup failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Email/Password Signup
  const signupWithEmail = async () => {
    try {
      setLoading(true);
      setError("");

      await createUserWithEmailAndPassword(auth, email, password);

      router.push("/dashboard");
    } catch (err: any) {
      setError("Signup failed. Try a stronger password or new email.");
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
          Create a free account
        </h1>

        <p className="mt-2 text-gray-600">
          Join thousands of users discovering the best AI tools.
        </p>

        {/* ✅ Google Signup Button */}
        <button
          onClick={signupWithGoogle}
          disabled={loading}
          className="w-full mt-8 flex items-center justify-center gap-3 border rounded-xl py-3 text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">Or continue with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* ✅ Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ✅ Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl px-4 py-3 mt-4 focus:outline-none focus:ring-2 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ Terms Checkbox */}
        <div className="flex items-start gap-2 mt-4 text-sm text-gray-500">
          <input type="checkbox" defaultChecked />
          <p>
            By signing up, you agree to our{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">
              Terms of Use
            </span>{" "}
            and{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        {/* ✅ Error */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* ✅ Sign Up Button */}
        <button
          onClick={signupWithEmail}
          disabled={loading}
          className="w-full mt-6 rounded-xl bg-blue-500 py-3 text-white font-semibold hover:bg-blue-600 transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {/* ✅ Sign In Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Have an account?{" "}
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
