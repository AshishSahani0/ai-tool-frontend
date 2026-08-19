"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle } from "lucide-react";

type ToolStatus = "PENDING" | "APPROVED" | "REJECTED";

type Tool = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: string;
  approvalStatus: ToolStatus;
  active: boolean;
  rejectionReason?: string;
  createdAt: string;
};

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

function StatusBadge({ status }: { status: ToolStatus }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} /> Approved
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle size={13} /> Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={13} /> Under Review
    </span>
  );
}

export default function MySubmittedToolsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    apiFetch<{ content: Tool[] }>("/api/user/tools?page=0&size=50")
      .then((res) => setTools(res?.content || []))
      .catch((err) => {
        console.error("Failed to fetch user tools:", err);
        setTools([]);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Submitted Tools</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track the status of your submitted AI tools and manage their listings.
          </p>
        </div>

        {user && (
          <Link
            href="/add-tool"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            <PlusCircle size={16} /> Submit New Tool
          </Link>
        )}
      </div>

      {!authLoading && !user && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Authentication Required</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please log in or create an account to view and manage your submitted AI tools.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Log In
          </Link>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-200 bg-slate-100/60 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && user && tools.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 bg-slate-50/30">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
            <PlusCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No tools submitted yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Ready to show your AI tool to the community? Submit your product for approval.
          </p>
          <Link
            href="/add-tool"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Submit a Tool
          </Link>
        </div>
      )}

      {!loading && user && tools.length > 0 && (
        <div className="space-y-4">
          {tools.map((tool) => {
            const logoUrl = tool.logoKey
              ? `${R2_PUBLIC_URL}/${tool.logoKey}`
              : "/placeholder.png";

            return (
              <div
                key={tool.id}
                onClick={() => router.push(`/my-tools/${tool.id}`)}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-slate-300 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={logoUrl}
                    alt={tool.name}
                    className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-blue-600 transition">
                        {tool.name}
                      </h3>
                      <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                        {tool.pricingType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {tool.shortDescription}
                    </p>
                    {tool.approvalStatus === "REJECTED" && tool.rejectionReason && (
                      <p className="text-xs text-rose-600 font-medium pt-0.5">
                        Feedback: {tool.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <StatusBadge status={tool.approvalStatus} />
                  <span className="text-xs text-slate-400 group-hover:text-slate-600 flex items-center transition">
                    Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}