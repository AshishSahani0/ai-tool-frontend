"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/ToastContext";
import { getUserProfile, exportUserData, UserProfile } from "@/lib/api/user";
import {
  User,
  Shield,
  Key,
  Mail,
  Calendar,
  Save,
  Download,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Star,
  Loader2,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, backendUser, loading: authLoading, logout, updateProfileName } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [providers, setProviders] = useState<string[]>([]);

  // Load user profile & providers
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const providerIds = user.providerData.map((p) => p.providerId) ?? [];
    setProviders(providerIds);

    getUserProfile()
      .then((data) => {
        setProfile(data);
        setNameInput(data.name || user.displayName || "");
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
        setNameInput(user.displayName || "");
      })
      .finally(() => setLoadingProfile(false));
  }, [user, authLoading, router]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      showToast("Display name cannot be empty", "error");
      return;
    }

    if (trimmed.length < 2) {
      showToast("Display name must be at least 2 characters", "error");
      return;
    }

    if (trimmed.length > 100) {
      showToast("Display name must be under 100 characters", "error");
      return;
    }

    setSavingName(true);
    try {
      await updateProfileName(trimmed);
      if (profile) {
        setProfile({ ...profile, name: trimmed });
      }
      showToast("Display name updated successfully 🎉", "success");
    } catch (err: any) {
      const msg = err?.message || "Failed to update profile name.";
      showToast(msg, "error");
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showToast(`Password reset link sent to ${user.email} 📩`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to send reset email.", "error");
    } finally {
      setSendingReset(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Account data exported successfully 💾", "success");
    } catch (err: any) {
      showToast("Failed to export account data.", "error");
    } finally {
      setExportingData(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      showToast("Logged out successfully 👋", "info");
      router.replace("/login");
    } catch {
      showToast("Logout encountered an issue.", "error");
    } finally {
      setLoggingOut(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading account settings...</span>
      </div>
    );
  }

  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");
  const role = profile?.role || backendUser?.role || "USER";
  const initials = (nameInput || user?.email || "U")
    .substring(0, 2)
    .toUpperCase();

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, activity, security preferences, and data.
          </p>
        </div>

        {/* PROFILE OVERVIEW HERO */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">
                  {nameInput || "User"}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    role === "ADMIN"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail size={13} /> {user?.email}
              </p>
            </div>
          </div>

          {formattedDate && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Calendar size={13} /> Member since {formattedDate}
            </div>
          )}
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/my-tools"
            className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Submitted Tools
              </span>
              <Layers size={18} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingProfile ? "—" : profile?.submittedToolsCount ?? 0}
            </p>
            <span className="text-xs text-blue-600 group-hover:underline inline-flex items-center gap-1 mt-1">
              View my tools <ExternalLink size={12} />
            </span>
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Approved & Live
              </span>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingProfile ? "—" : profile?.approvedToolsCount ?? 0}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Public in AI Directory
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Reviews Given
              </span>
              <Star size={18} className="text-amber-500 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingProfile ? "—" : profile?.reviewsCount ?? 0}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Community ratings
            </span>
          </div>
        </div>

        {/* PROFILE INFORMATION SECTION */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Personal Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update how your name appears across reviews and tool submissions.
            </p>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed pr-10"
                />
                <Lock
                  size={16}
                  className="absolute right-3.5 top-3 text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your email is verified with Firebase and cannot be changed here.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingName || nameInput.trim() === profile?.name}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {savingName ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* SECURITY & AUTHENTICATION METHODS */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" /> Security & Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control your sign-in credentials and connected identity providers.
            </p>
          </div>

          <div className="space-y-6">
            {/* Password Credentials */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">
                    Account Password
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {hasPassword
                    ? "Password authentication is active for this account."
                    : "No password configured. You sign in using Google OAuth."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasPassword ? (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={sendingReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition"
                  >
                    {sendingReset ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                ) : (
                  hasGoogle && (
                    <Link
                      href="/set-password"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                    >
                      Set Password
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Login Methods */}
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Active Sign-In Methods
              </p>
              <div className="flex flex-wrap gap-2">
                {hasGoogle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs">
                    <span className="font-bold text-red-500">G</span> Google OAuth
                  </span>
                )}
                {hasPassword && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs">
                    <Key size={13} className="text-blue-600" /> Email & Password
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DATA & ACCOUNT ACTIONS */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Data & Account Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Export your submissions and manage your current session.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Export Account Data
              </p>
              <p className="text-xs text-slate-500">
                Download a complete JSON archive of your profile and tool submissions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              disabled={exportingData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shrink-0"
            >
              {exportingData ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Download size={14} /> Download Archive
                </>
              )}
            </button>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Sign Out
              </p>
              <p className="text-xs text-slate-500">
                End your active session on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition shrink-0"
            >
              {loggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <LogOut size={14} /> Sign Out
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}