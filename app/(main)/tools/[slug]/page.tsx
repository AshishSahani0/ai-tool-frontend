import { notFound } from "next/navigation";

import WriteReviewSection from "@/components/WriteReviewSection";
import ReviewsListSection from "@/components/ReviewsListSection";

type Tool = {
  id: string;
  slug: string;
  name: string;
  website: string;
  shortDescription: string;
  longDescription?: string;
  differentiation?: string;
  logoKey?: string;
  hashtags: string[];
  pricingType: "FREE" | "PAID" | "FREEMIUM";
  pricingDetails?: string;
  pros?: string[];
  cons?: string[];
  useCases?: string[];
  uniqueFeatures?: string[];
  rating: number;
  reviewsCount: number;
  views: number;
  verified: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

// Always fetch fresh (since you increment views)
export const dynamic = "force-dynamic";

async function getTool(slug: string): Promise<Tool | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/tools/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

export default async function ToolDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ unwrap params (Next 15+ requirement)
  const { slug } = await params;

  const tool = await getTool(slug);

  if (!tool) notFound();

  const logoUrl = tool.logoKey
    ? `${R2_PUBLIC_URL}/${tool.logoKey}`
    : "/placeholder.png";

  return (
    <>
    
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-12 flex gap-6">
          <img
            src={logoUrl}
            alt={tool.name}
            className="w-24 h-24 rounded-2xl border bg-white object-contain"
          />

          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {tool.name}

              {tool.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Verified
                </span>
              )}

              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {tool.pricingType}
              </span>
            </h1>

            <p className="text-slate-600 max-w-2xl">
              {tool.shortDescription}
            </p>

            <p className="text-sm text-slate-500">
              ⭐ {tool.rating.toFixed(1)} ({tool.reviewsCount} reviews)
              {" • "} 👁 {tool.views} views
            </p>

            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white px-5 py-2 rounded-lg"
            >
              Visit Website ↗
            </a>
          </div>

          <div className="border rounded-xl p-5 text-center w-32">
            <p className="text-3xl font-bold">
              {tool.rating.toFixed(1)}
            </p>
            <p className="text-sm text-slate-500">
              {tool.reviewsCount} Reviews
            </p>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="col-span-2 space-y-6">
            {tool.longDescription && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-3">
                  About this tool
                </h2>
                <p className="text-slate-600 whitespace-pre-line">
                  {tool.longDescription}
                </p>
              </div>
            )}

            {tool.differentiation && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-3">
                  What makes it different
                </h2>
                <p className="text-slate-600 whitespace-pre-line">
                  {tool.differentiation}
                </p>
              </div>
            )}

            {tool.uniqueFeatures?.length ? (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">
                  ⭐ Unique features
                </h2>
                <ul className="grid grid-cols-2 gap-3 text-slate-600">
                  {tool.uniqueFeatures.map((f, i) => (
                    <li key={i}>✔ {f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">At a glance</h3>

              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <strong>Pricing:</strong> {tool.pricingType}
                </p>

                {tool.pricingDetails && (
                  <p>
                    <strong>Details:</strong>{" "}
                    {tool.pricingDetails}
                  </p>
                )}

                <p>
                  <strong>Views:</strong> {tool.views}
                </p>

                <p>
                  <strong>Verified:</strong>{" "}
                  {tool.verified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WRITE REVIEW */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <WriteReviewSection toolId={tool.id} />
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <h2 className="text-2xl font-bold mb-8">
            All Reviews
          </h2>
          <ReviewsListSection toolId={tool.id} />
        </div>
      </section>
    </>
  );
}