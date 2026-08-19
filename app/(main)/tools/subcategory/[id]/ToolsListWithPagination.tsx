"use client";

import { useEffect, useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import {
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  CheckCircle2,
} from "lucide-react";

type PricingType = "FREE" | "PAID" | "FREEMIUM";

type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: PricingType;
  rating: number;
  reviewsCount: number;
  views: number;
  verified: boolean;
  website?: string;
  hashtags?: string[];
};

type PageResponse = {
  content: Tool[];
  totalPages?: number;
  totalElements?: number;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 9;

export default function ToolsListWithPagination({
  subCategoryId,
}: {
  subCategoryId: string;
}) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const [pricing, setPricing] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState("popularityScore");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTools() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", PAGE_SIZE.toString());
        params.append("sortBy", sortBy);

        if (pricing) {
          params.append("pricingType", pricing);
        }

        if (verified !== null) {
          params.append("verified", String(verified));
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456";
        const res = await fetch(
          `${baseUrl}/api/public/subcategories/${subCategoryId}/tools?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch tools");
        }

        const data: PageResponse = await res.json();
        setTools(data?.content || []);
        setTotalPages(data?.page?.totalPages ?? data?.totalPages ?? 0);
        setTotalElements(data?.page?.totalElements ?? data?.totalElements ?? 0);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed loading tools:", err);
          setTools([]);
          setTotalPages(0);
        }
      } finally {
        setLoading(false);
      }
    }

    loadTools();

    return () => {
      controller.abort();
    };
  }, [subCategoryId, page, pricing, verified, sortBy]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase().trim();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.hashtags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [tools, searchQuery]);

  const resetFilters = () => {
    setPricing(null);
    setVerified(null);
    setSortBy("popularityScore");
    setSearchQuery("");
    setPage(0);
  };

  const hasActiveFilters =
    pricing !== null || verified !== null || searchQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search tools in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-slate-400" />
              <select
                value={pricing || ""}
                onChange={(e) => {
                  setPage(0);
                  setPricing(e.target.value || null);
                }}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
              >
                <option value="">All Pricing</option>
                <option value="FREE">Free</option>
                <option value="PAID">Paid</option>
                <option value="FREEMIUM">Freemium</option>
              </select>
            </div>

            <select
              value={verified === null ? "" : String(verified)}
              onChange={(e) => {
                setPage(0);
                setVerified(
                  e.target.value === "" ? null : e.target.value === "true"
                );
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="">All Status</option>
              <option value="true">Verified Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setPage(0);
                setSortBy(e.target.value);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="popularityScore">Most Popular</option>
              <option value="views">Most Viewed</option>
              <option value="rating">Highest Rated</option>
              <option value="createdAt">Recently Added</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Active filters:</span>
            {pricing && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md font-medium">
                Pricing: {pricing}
              </span>
            )}
            {verified && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md font-medium">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                Query: "{searchQuery}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* TOOLS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200/70 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200/70 rounded-md w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded-md w-full animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-md w-4/5 animate-pulse" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div className="h-3 bg-slate-100 rounded-md w-1/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-md w-1/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 bg-white/60">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No tools found matching your criteria
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, pricing model, or verification filter to explore available tools.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
          >
            <RefreshCw size={13} /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p>
            Showing <span className="font-semibold text-slate-800">{page * PAGE_SIZE + 1}</span> to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min((page + 1) * PAGE_SIZE, totalElements)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{totalElements}</span> tools
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition bg-white shadow-xs"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs">
              {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition bg-white shadow-xs"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}