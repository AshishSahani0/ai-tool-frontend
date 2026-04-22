"use client";

import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

type PricingType = "FREE" | "PAID" | "FREEMIUM";

type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: PricingType;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  website?: string;
  hashtags?: string[];
};

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

export default function ToolCard({ tool }: { tool: Tool }) {
  const logoUrl = tool.logoKey
    ? `${R2_PUBLIC_URL}/${tool.logoKey}`
    : "/placeholder.png";

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-1 transition space-y-4">

      {/* ✅ PLUS ICON (Top Right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log("Add to compare:", tool.slug);
        }}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 transition"
      >
        <Plus size={16} />
      </button>

      {/* CLICKABLE AREA */}
      <Link href={`/tools/${tool.slug}`} className="block space-y-4">

        {/* HEADER */}
        <div className="flex gap-4 items-center">
          <img
            src={logoUrl}
            alt={tool.name}
            className="w-14 h-14 rounded-lg object-contain border bg-white"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {tool.name}
              </h3>

              {tool.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span>{tool.pricingType}</span>

              <span className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{tool.rating ? tool.rating.toFixed(1) : "0.0"}</span>
                <span className="text-slate-400">
                  ({tool.reviewsCount ?? 0})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-slate-600 line-clamp-3">
          {tool.shortDescription}
        </p>

        {/* HASHTAGS */}
        {tool.hashtags?.length ? (
          <div className="flex flex-wrap gap-2">
            {tool.hashtags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </Link>

      {/* VISIT BUTTON */}
      {tool.website && (
        <div className="pt-2 border-t">
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Visit
            <ExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
}