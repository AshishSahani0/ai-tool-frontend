"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, Check, Loader2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";

type Tool = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: "FREE" | "PAID" | "FREEMIUM";
  rating: number;
  reviewsCount: number;
  verified: boolean;
  website?: string;
  hashtags?: string[];
};

type SubCategory = {
  id: string;
  name: string;
  toolCount: number;
};

type CategoryWithSubs = {
  id: string;
  name: string;
  imageKey: string | null;
  subCategories: SubCategory[];
};

export default function DashboardSearchBar() {
  const [query, setQuery] = useState("");
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [pricingType, setPricingType] = useState<string>("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState("popularityScore");
  const [page, setPage] = useState(0);

  const [results, setResults] = useState<Tool[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryWithSubs[]>([]);

  // Load category and subcategory list for advanced search dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/categories/full`);
        if (res.ok) {
          const data = await res.json();
          setCategoriesList(data || []);
        }
      } catch (err) {
        console.error("Failed to load categories for advanced filters:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch search results when query or filter criteria change
  useEffect(() => {
    const trimmed = query.trim();
    const hasActiveFilters = !!subCategoryId || !!pricingType || verified !== null;

    if (trimmed.length < 2 && !hasActiveFilters) {
      setResults([]);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (trimmed.length >= 2) {
          params.append("q", trimmed);
        }
        if (subCategoryId) {
          params.append("subCategoryId", subCategoryId);
        }
        if (pricingType) {
          params.append("pricingType", pricingType);
        }
        if (verified !== null) {
          params.append("verified", String(verified));
        }
        params.append("sortBy", sortBy);
        params.append("page", page.toString());
        params.append("size", "6");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/search?${params.toString()}`
        );

        if (!res.ok) {
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults(data.results || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setExpanded(true);
      } catch (err) {
        console.error("Smart search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, subCategoryId, pricingType, verified, sortBy, page]);

  const handleFilterChange = (setter: any, value: any) => {
    setPage(0);
    setter(value);
  };

  const clearFilters = () => {
    setPage(0);
    setSubCategoryId("");
    setPricingType("");
    setVerified(null);
    setSortBy("popularityScore");
    setQuery("");
  };

  const showResults = query.trim().length >= 2 || !!subCategoryId || !!pricingType || verified !== null;

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-6">
        
        {/* SEARCH BAR INPUT AND FILTER TOGGLE */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 group">
            {/* Animated Border Layer */}
            <div
              className="absolute inset-0 rounded-2xl p-[3px] 
                 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600
                 opacity-0 group-focus-within:opacity-100
                 transition-opacity duration-500
                 animate-borderSpin"
            >
              <div className="h-full w-full rounded-2xl bg-white" />
            </div>

            {/* Actual Input */}
            <input
              type="text"
              placeholder="Search AI tools... e.g. 'writing assistant' or 'image generator'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="relative w-full bg-white border border-slate-300 
                 rounded-2xl px-6 py-4 text-base shadow-sm 
                 focus:outline-none transition-colors duration-300 focus:border-transparent"
            />

            {loading && (
              <span className="absolute right-5 top-4.5 text-slate-400">
                <Loader2 className="animate-spin" size={20} />
              </span>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-4 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
              showFilters || !!subCategoryId || !!pricingType || verified !== null
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* EXPANDABLE FILTER DRAWER */}
        {showFilters && (
          <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-inner grid gap-6 grid-cols-1 md:grid-cols-4 animate-fadeIn">
            
            {/* 1. Category/Subcategory Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subcategory</label>
              <select
                value={subCategoryId}
                onChange={(e) => handleFilterChange(setSubCategoryId, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Subcategories</option>
                {categoriesList.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* 2. Pricing Pills */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing</label>
              <div className="flex flex-wrap gap-2">
                {["", "FREE", "FREEMIUM", "PAID"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(setPricingType, type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      pricingType === type
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {type === "" ? "All" : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Verified Toggle Switch */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification</label>
              <div className="flex items-center mt-1">
                <button
                  onClick={() => handleFilterChange(setVerified, verified === null ? true : verified ? false : null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    verified === true
                      ? "bg-green-50 border-green-200 text-green-700 font-semibold"
                      : verified === false
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {verified === true ? "✓ Verified Only" : verified === false ? "✗ Unverified" : "Show All"}
                </button>
              </div>
            </div>

            {/* 4. Sorting & Reset */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="popularityScore">Popularity</option>
                  <option value="views">Views</option>
                  <option value="rating">Rating</option>
                  <option value="createdAt">Newest</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-medium transition"
                >
                  Reset
                </button>
              </div>
            </div>

          </div>
        )}

        {/* RESULTS WRAPPER */}
        {showResults && (
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              expanded ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
            }`}
          >
            {/* Subtle Divider & Stats */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-medium">
                {totalElements} {totalElements === 1 ? "tool" : "tools"} found
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4" />
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-slate-500 text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
                No tools match your criteria
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="opacity-0 translate-y-4 animate-fadeIn"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            )}

            {/* ADVANCED PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* EXPANSION SLIDER ARROW BUTTON */}
        {showResults && results.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1 px-8 py-1 rounded-full 
                       bg-slate-900 text-white text-xs font-medium 
                       hover:bg-slate-800 transition"
            >
              {expanded ? (
                <>
                  <ChevronUp size={20} />
                  <span>Hide results</span>
                </>
              ) : (
                <>
                  <ChevronDown size={20} />
                  <span>Show results</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
