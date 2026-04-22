"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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

export default function DashboardSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/search?q=${encodeURIComponent(trimmed)}`,
        );

        if (!res.ok) {
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults((data.results || []).slice(0, 6));
        setExpanded(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const showResults = query.trim().length >= 2;

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* SEARCH INPUT */}
        {/* SEARCH INPUT */}
        <div className="relative group">
          {/* Animated Border Layer */}
          <div
            className="absolute inset-0 rounded-2xl p-[5px] 
               bg-gradient-to-r from-black via-slate-500 to-black
               opacity-0 group-focus-within:opacity-100
               transition-opacity duration-500
               animate-borderSpin"
          >
            <div className="h-full w-full rounded-2xl bg-white" />
          </div>

          {/* Actual Input */}
          <input
            type="text"
            placeholder="Search AI tools... write query about the tool you want to find, e.g. 'best AI writing assistant' or 'AI tools for developers'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="relative w-full bg-white border border-slate-300 
               rounded-2xl px-6 py-4 text-lg shadow-sm 
               focus:outline-none transition"
          />
        </div>

        {/* SLIDING RESULTS CONTAINER */}
        {showResults && (
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              expanded ? "max-h-[2000px] opacity-100 mt-8" : "max-h-0 opacity-0"
            }`}
          >
            {/* subtle divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6" />

            {loading && (
              <div className="text-slate-500 text-center py-8">
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-slate-500 text-center py-8">
                No tools found
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="opacity-0 translate-y-4 animate-fadeIn"
                    style={{
                      animationDelay: `${index * 80}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ARROW BELOW RESULTS */}
        {showResults && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap- px-10 py-1 rounded-full 
                       bg-black text-white text-sm font-medium 
                       hover:bg-slate-800 transition"
            >
              {expanded ? (
                <>
                  <ChevronUp size={30} />
                </>
              ) : (
                <>
                  <ChevronDown size={30} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
