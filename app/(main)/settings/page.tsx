"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthState } from "@/hooks/useAuthState";
import { logout } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuthState();

  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/dashboard");
      return;
    }

    if (user) {
      const providerIds =
        user.providerData.map((p) => p.providerId) ?? [];
      setProviders(providerIds);
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow p-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account and security settings
        </p>

        <hr className="my-6" />

        {/* Profile Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Profile
          </h2>

          <div className="mt-4">
            <label className="text-sm text-gray-500">
              Email
            </label>
            <p className="mt-1 text-gray-800 font-medium">
              {user.email}
            </p>
          </div>
        </section>

        <hr className="my-6" />

        {/* Security Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Security
          </h2>

          {/* Password */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                Password
              </p>
              <p className="text-sm text-gray-500">
                {hasPassword
                  ? "Password is set"
                  : "No password set"}
              </p>
            </div>

            {!hasPassword && hasGoogle && (
              <Link
                href="/set-password"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition"
              >
                Set password
              </Link>
            )}
          </div>

          {/* Login Methods */}
          <div className="mt-6">
            <p className="font-medium text-gray-800">
              Login methods
            </p>

            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {providers.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </div>
        </section>

        <hr className="my-6" />

        {/* Account Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Account
          </h2>

          <button
            onClick={async () => {
              await logout();
              router.replace("/dashboard");
            }}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Log out
          </button>
        </section>

      </div>
    </main>
  );
}