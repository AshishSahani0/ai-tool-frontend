import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ExternalLink,
  Star,
  Eye,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

import WriteReviewSection from "@/components/WriteReviewSection";
import ReviewsListSection from "@/components/ReviewsListSection";
import ToolCard from "@/components/ToolCard";

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

type RelatedTool = {
  slug: string;
  name: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: "FREE" | "PAID" | "FREEMIUM";
  rating: number;
  reviewsCount: number;
  views: number;
  verified: boolean;
  website?: string;
  hashtags?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456";
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

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

async function getRelatedTools(slug: string): Promise<RelatedTool[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/tools/${slug}/related?limit=4`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);

  if (!tool) {
    return {
      title: "Tool Not Found | AI Tools Directory",
      description: "Discover top AI tools, reviews, and alternatives.",
    };
  }

  const logoUrl = tool.logoKey
    ? `${R2_PUBLIC_URL}/${tool.logoKey}`
    : "/placeholder.png";

  return {
    title: `${tool.name} - Features, Pricing & Reviews | AItoolHub`,
    description: tool.shortDescription,
    openGraph: {
      title: `${tool.name} | AI Directory`,
      description: tool.shortDescription,
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 600,
          alt: `${tool.name} Logo`,
        },
      ],
    },
  };
}

export default async function ToolDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tool, relatedTools] = await Promise.all([
    getTool(slug),
    getRelatedTools(slug),
  ]);

  if (!tool) notFound();

  const logoUrl = tool.logoKey
    ? `${R2_PUBLIC_URL}/${tool.logoKey}`
    : "/placeholder.png";

  // Schema.org SoftwareApplication JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.shortDescription,
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: tool.pricingType === "FREE" ? "0" : undefined,
      priceCurrency: "USD",
    },
    aggregateRating:
      tool.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: tool.rating.toFixed(1),
            reviewCount: tool.reviewsCount,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-6 flex-1">
            <img
              src={logoUrl}
              alt={tool.name}
              className="w-24 h-24 rounded-2xl border border-slate-200 bg-white object-contain p-2 shadow-xs shrink-0"
            />

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {tool.name}
                </h1>

                {tool.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={14} /> Verified
                  </span>
                )}

                <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                  {tool.pricingType}
                </span>
              </div>

              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                {tool.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-semibold">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {tool.rating.toFixed(1)} ({tool.reviewsCount} reviews)
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Eye size={14} /> {tool.views} views
                </span>
              </div>

              {tool.hashtags && tool.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tool.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-slate-500 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-0.5 rounded-md transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/compare?slugs=${tool.slug}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
              >
                <SlidersHorizontal size={14} />
                <span>Compare</span>
              </Link>

              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition shadow-sm text-xs"
              >
                <span>Visit Website</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="border border-slate-200 bg-white rounded-2xl p-3.5 text-center min-w-[140px] shadow-xs hidden sm:block">
              <p className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                <Star size={18} className="fill-amber-400 text-amber-400" />
                {tool.rating.toFixed(1)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {tool.reviewsCount} Verified Reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: ABOUT & FEATURES */}
          <div className="lg:col-span-2 space-y-8">
            {tool.longDescription && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  About {tool.name}
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {tool.longDescription}
                </p>
              </div>
            )}

            {tool.differentiation && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="text-amber-500" size={20} />
                  What Makes It Unique
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {tool.differentiation}
                </p>
              </div>
            )}

            {tool.uniqueFeatures && tool.uniqueFeatures.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Key Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tool.uniqueFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-slate-700 text-sm bg-slate-50/80 border border-slate-100 p-3 rounded-xl"
                    >
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROS & CONS */}
            {(tool.pros?.length || tool.cons?.length) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tool.pros && tool.pros.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                    <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                      <ThumbsUp size={18} className="text-emerald-600" /> Pros
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {tool.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool.cons && tool.cons.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                    <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                      <ThumbsDown size={18} className="text-rose-600" /> Cons
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {tool.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* USE CASES */}
            {tool.useCases && tool.useCases.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Ideal Use Cases
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tool.useCases.map((uc, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AT A GLANCE & CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                Overview & Pricing
              </h3>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pricing Model</span>
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {tool.pricingType}
                  </span>
                </div>

                {tool.pricingDetails && (
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Pricing Details</span>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      {tool.pricingDetails}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Views</span>
                  <span className="font-semibold text-slate-900">
                    {tool.views.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Verified Listing</span>
                  <span className="font-semibold text-slate-900">
                    {tool.verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition text-sm shadow-sm"
              >
                Visit Website <ExternalLink size={14} />
              </a>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-base">Have you used {tool.name}?</h4>
              <p className="text-xs text-slate-300">
                Help fellow creators and builders by sharing your authentic review.
              </p>
              <WriteReviewSection toolId={tool.id} />
            </div>
          </div>
        </div>
      </section>

      {/* ALTERNATIVE & SIMILAR TOOLS SECTION */}
      {relatedTools.length > 0 && (
        <section className="py-12 bg-slate-100/50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={20} />
                  Similar & Alternative AI Tools
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Explore other high-rated tools in the same subcategory
                </p>
              </div>

              <Link
                href={`/compare?slugs=${tool.slug},${relatedTools[0].slug}`}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Compare Alternatives →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedTools.map((rel) => (
                <ToolCard key={rel.slug} tool={rel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section className="bg-white border-t border-slate-200/80 py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Community Reviews
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Real feedback and ratings from verified users and developers
              </p>
            </div>
            <WriteReviewSection toolId={tool.id} />
          </div>

          <ReviewsListSection toolId={tool.id} />
        </div>
      </section>
    </div>
  );
}