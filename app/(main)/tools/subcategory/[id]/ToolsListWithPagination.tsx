"use client";

import { useEffect, useState } from "react";
import ToolCard from "@/components/ToolCard";
import { publicFetch } from "@/lib/publicApi";

type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: "FREE" | "PAID" | "FREEMIUM";
  rating: number;
  reviewsCount: number;
  views: number;
  verified: boolean;
};

type PageResponse = {
  content: Tool[];
  totalPages: number;
  totalElements: number;
};

const PAGE_SIZE = 9;

export default function ToolsListWithPagination({
  subCategoryId,
}: {
  subCategoryId: string;
}) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [pricing, setPricing] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState("views");

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", PAGE_SIZE.toString());
    params.append("sortBy", sortBy);

    if (pricing) params.append("pricingType", pricing);
    if (verified !== null) params.append("verified", String(verified));

    publicFetch<PageResponse>(
      `/api/public/subcategories/${subCategoryId}/tools?${params.toString()}`
    )
      .then((data) => {
        setTools(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [subCategoryId, page, pricing, verified, sortBy]);

  return (
    <div className="space-y-10">
      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4">
        <select
          onChange={(e) => {
            setPage(0);
            setPricing(e.target.value || null);
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Pricing</option>
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
          <option value="FREEMIUM">Freemium</option>
        </select>

        <select
          onChange={(e) => {
            setPage(0);
            setVerified(
              e.target.value === ""
                ? null
                : e.target.value === "true"
            );
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All</option>
          <option value="true">Verified Only</option>
        </select>

        <select
          onChange={(e) => {
            setPage(0);
            setSortBy(e.target.value);
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="views">Sort by Views</option>
          <option value="rating">Sort by Rating</option>
          <option value="createdAt">Newest</option>
        </select>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <p className="text-slate-500">No tools found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}