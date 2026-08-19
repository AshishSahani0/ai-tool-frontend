"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";

type Review = {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456";

export default function ReviewsListSection({ toolId }: { toolId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/tools/${toolId}/reviews`);

        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [toolId]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-1/6" />
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <MessageSquare size={20} />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No community reviews yet</h4>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Be the first to share your experience with this tool and help others make informed decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r, idx) => {
        const initial = r.name ? r.name.charAt(0).toUpperCase() : "U";

        return (
          <div
            key={r.id || idx}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {initial}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {r.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-lg">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 fill-slate-100"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 ml-1">
                  {r.rating}.0
                </span>
              </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed pl-13">
              {r.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}