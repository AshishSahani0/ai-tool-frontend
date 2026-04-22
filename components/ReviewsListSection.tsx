"use client";

import { useEffect, useState } from "react";

type Review = {
  id?: string;
  _id?: string; // ✅ handle Mongo fallback
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ReviewsListSection({ toolId }: { toolId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/tools/${toolId}/reviews`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [toolId]);

  if (loading) {
    return <div className="text-slate-500">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-slate-500">
        No reviews yet. Be the first to review.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((r) => (
        <div
          key={r.id || r._id} // ✅ fallback fix
          className="border-b pb-6"
        >
          <div className="flex justify-between items-center">
            <strong>{r.name}</strong>
            <span className="text-yellow-500">
              {"★".repeat(r.rating)}
            </span>
          </div>

          <p className="text-slate-600 mt-2">{r.comment}</p>

          <p className="text-xs text-slate-400 mt-2">
            {new Date(r.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}