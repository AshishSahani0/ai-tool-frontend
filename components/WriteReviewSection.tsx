"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/ToastContext";
import { Star, X, Loader2, MessageSquarePlus } from "lucide-react";

export default function WriteReviewSection({
  toolId,
}: {
  toolId: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setComment("");
    setName("");
    setRating(0);
    setHoverRating(0);
  };

  const submit = async () => {
    if (loading) return;

    if (rating === 0) {
      showToast("Please select a star rating (1-5)", "error");
      return;
    }

    if (!user && !name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (comment.trim().length < 5) {
      showToast("Review must be at least 5 characters", "error");
      return;
    }

    if (comment.trim().length > 1000) {
      showToast("Review cannot exceed 1000 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const body = {
        name: user ? undefined : name.trim(),
        rating,
        comment: comment.trim(),
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(
        `${baseUrl}/api/public/tools/${toolId}/reviews`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || data?.error || "Failed to submit review.";
        showToast(msg, "error");
        return;
      }

      showToast("Review submitted successfully 🎉", "success");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm"
      >
        <MessageSquarePlus size={18} /> Write a Review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 z-10 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Write Your Review
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share your experience with other creators
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* User status info */}
            {user ? (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border">
                Reviewing as <span className="font-semibold text-slate-900">{user.displayName || user.email}</span> (Verified)
              </div>
            ) : null}

            {/* Stars Selection with Hover */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition text-slate-300"
                    >
                      <Star
                        size={28}
                        className={
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  );
                })}
                <span className="text-sm font-semibold text-slate-600 ml-2">
                  {hoverRating || rating ? `${hoverRating || rating} / 5` : "Select rating"}
                </span>
              </div>
            </div>

            {!user && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Review Comment
                </label>
                <span className="text-xs text-slate-400">
                  {comment.length}/1000
                </span>
              </div>
              <textarea
                placeholder="What did you like or dislike? How does it fit into your workflow?"
                value={comment}
                maxLength={1000}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition h-32 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-60 transition text-sm flex items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Post Review"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}