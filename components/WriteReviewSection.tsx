"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/toast/ToastContext";

export default function WriteReviewSection({
  toolId,
}: {
  toolId: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  const resetForm = () => {
    setComment("");
    setName("");
    setRating(0);
  };

  const submit = async () => {
    if (loading) return;

    if (rating === 0) {
      showToast("Please select rating", "error");
      return;
    }

    if (!user && !name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (comment.trim().length < 5) {
      showToast("Comment must be at least 5 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const body = {
        name: user ? undefined : name.trim(),
        rating,
        comment: comment.trim(),
      };

      const headers: any = {
        "Content-Type": "application/json",
      };

      if (user) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/tools/${toolId}/reviews`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );

      const data = await res.json().catch(() => null);

      // 🔥 Handle validation errors cleanly
      if (!res.ok) {
        if (res.status === 400 && data?.message) {
          showToast(data.message, "info");
          setOpen(false);
          return;
        }

        showToast("Something went wrong", "error");
        return;
      }

      // ✅ Success
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
        className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
      >
        Write a Review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 space-y-6 z-10">
            <h2 className="text-2xl font-semibold">
              Write your review
            </h2>

            {/* Stars */}
            <div className="flex gap-2 text-2xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={
                    star <= rating
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>

            {!user && (
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-4 py-3"
              />
            )}

            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded px-4 py-3 h-32"
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-xl border"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-xl disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}