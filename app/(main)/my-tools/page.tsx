"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useAuthState } from "@/hooks/useAuthState";
import { useRouter } from "next/navigation";

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

function StatusBadge({ status }: { status: ToolStatus }) {
  const statusStyles: Record<ToolStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

export default function MySubmittedToolsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthState();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);

    apiFetch<{ content: Tool[] }>("/api/user/tools?page=0&size=20")
      .then((res) => setTools(res.content))
      .finally(() => setLoading(false));

  }, [authLoading, user]);

  return (
    
      <div className="max-w-5xl mx-auto p-10 space-y-6">
        <h1 className="text-3xl font-bold">My Submitted Tools</h1>

        {!authLoading && !user && (
          <p className="text-gray-500">
            Please login to view your submitted tools.
          </p>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && user && tools.length === 0 && (
          <p className="text-gray-500">
            You haven’t submitted any tools yet.
          </p>
        )}

        {!loading && tools.length > 0 && (
          <div className="space-y-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => router.push(`/my-tools/${tool.id}`)}
                className="rounded-xl border p-5 flex justify-between items-start cursor-pointer hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-semibold text-lg">{tool.name}</h3>

                  {tool.approvalStatus === "REJECTED" && (
                    <p className="mt-2 text-sm text-red-600">
                      Reason: {tool.rejectionReason}
                    </p>
                  )}
                </div>

                <StatusBadge status={tool.approvalStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
}