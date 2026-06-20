"use client";

import { Download, ExternalLink, Award, Sparkles, Check, X, ShieldAlert, Share2 } from "lucide-react";
import { useToast } from "@/components/toast/ToastContext";

type PricingType = "FREE" | "PAID" | "FREEMIUM";

type Tool = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  logoKey?: string;
  pricingType: PricingType;
  pricingDetails?: string;
  rating: number;
  reviewsCount: number;
  views: number;
  popularityScore: number;
  verified: boolean;
  website?: string;
  hashtags?: string[];
  uniqueFeatures?: string[];
  pros?: string[];
  cons?: string[];
  useCases?: string[];
  updatedAt?: string;
};

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

export default function CompareClient({ tools }: { tools: Tool[] }) {
  const { showToast } = useToast();

  const handleShareLink = async () => {
    if (typeof window !== "undefined") {
      const shareData = {
        title: "AI Tools Comparison | AItoolHub",
        text: `Check out this side-by-side comparison of ${tools.map((t) => t.name).join(", ")}!`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log("Share failed or cancelled", err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Comparison link copied to clipboard!", "success");
        } catch (err) {
          console.error("Clipboard copy failed", err);
          showToast("Failed to copy link", "error");
        }
      }
    }
  };
  
  const handleDownloadPDF = () => {
    window.print();
  };

  if (!tools || tools.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <ShieldAlert className="mx-auto text-slate-400 mb-4" size={60} />
        <h2 className="text-2xl font-bold text-slate-800">No tools selected</h2>
        <p className="text-slate-500 mt-2">
          Add tools to comparison list by clicking the plus icon (+) on tool cards.
        </p>
      </div>
    );
  }

  // Dynamically calculate the Overall Winner: 60% Rating, 40% Popularity Score
  let winnerIndex = -1;
  let maxScore = -1;

  tools.forEach((tool, index) => {
    const ratingScore = tool.rating || 0; // 0 to 5
    // Normalize popularity score to a similar scale
    const popScoreNormalized = Math.min(tool.popularityScore || 0, 100) / 20; // scale 0-100 down to 0-5
    
    const combinedScore = (ratingScore * 0.6) + (popScoreNormalized * 0.4);
    if (combinedScore > maxScore) {
      maxScore = combinedScore;
      winnerIndex = index;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      
      {/* Title & Download Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-600" />
            <span>AI Tools Comparison</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare features, capabilities, pricing, and pros & cons side-by-side.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShareLink}
            className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl px-5 py-3 text-xs font-semibold shadow-sm hover:shadow-md transition duration-300 w-fit"
          >
            <Share2 size={16} />
            <span>Share Comparison</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 text-xs font-semibold shadow-md hover:shadow-lg transition duration-300 w-fit"
          >
            <Download size={16} />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Styled block for native printing format */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, footer, nav, .compare-bar {
            display: none !important;
          }
          .print-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Print Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden print-container">
        
        {/* Table/Grid Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200 bg-slate-50/50">
          
          {/* Label Column Header */}
          <div className="p-6 flex items-end font-semibold text-slate-500 text-sm hidden md:flex border-r border-slate-200">
            Comparison Criteria
          </div>

          {/* Tools Columns Header */}
          {tools.map((tool, idx) => {
            const isWinner = idx === winnerIndex;
            const logoUrl = tool.logoKey
              ? `${R2_PUBLIC_URL}/${tool.logoKey}`
              : "/placeholder.png";

            return (
              <div 
                key={tool.id} 
                className={`p-6 flex flex-col items-center text-center relative border-r last:border-r-0 border-slate-200 ${
                  isWinner ? "bg-amber-50/30" : ""
                }`}
              >
                {/* Dynamic Winner Badge */}
                {isWinner && (
                  <span className="absolute -top-1 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-xl flex items-center gap-1 shadow-sm uppercase tracking-wider">
                    <Award size={10} />
                    Overall Winner
                  </span>
                )}

                <img
                  src={logoUrl}
                  alt={tool.name}
                  className="w-16 h-16 rounded-2xl object-contain border bg-white shadow-sm mb-4 mt-2"
                />

                <h3 className="font-bold text-slate-900 text-lg">{tool.name}</h3>

                {tool.website && (
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-print inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>Visit website</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* 1. Ratings Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Ratings & Reviews
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                <span className="text-yellow-500 text-lg">★</span>
                <span>{tool.rating ? tool.rating.toFixed(1) : "0.0"}</span>
                <span className="text-slate-400 text-xs font-normal">/ 5.0</span>
              </div>
              <span className="text-xs text-slate-500 mt-1">Based on {tool.reviewsCount || 0} user reviews</span>
            </div>
          ))}
        </div>

        {/* 2. Pricing Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Pricing Type
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center gap-1">
              <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full w-fit ${
                tool.pricingType === "FREE"
                  ? "bg-green-100 text-green-800"
                  : tool.pricingType === "FREEMIUM"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}>
                {tool.pricingType}
              </span>
              <p className="text-xs text-slate-500 mt-1">{tool.pricingDetails || "No pricing details listed."}</p>
            </div>
          ))}
        </div>

        {/* 3. Unique Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Unique Features
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center gap-1.5">
              {tool.uniqueFeatures && tool.uniqueFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tool.uniqueFeatures.map((feat) => (
                    <span key={feat} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-md">
                      {feat}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">Not specified</span>
              )}
            </div>
          ))}
        </div>

        {/* 4. Pros Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Pros
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center">
              {tool.pros && tool.pros.length > 0 ? (
                <ul className="space-y-1">
                  {tool.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Check className="text-green-600 shrink-0 mt-0.5" size={14} />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-xs italic">Not specified</span>
              )}
            </div>
          ))}
        </div>

        {/* 5. Cons Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Cons
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center">
              {tool.cons && tool.cons.length > 0 ? (
                <ul className="space-y-1">
                  {tool.cons.map((con) => (
                    <li key={con} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <X className="text-red-500 shrink-0 mt-0.5" size={14} />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-xs italic">Not specified</span>
              )}
            </div>
          ))}
        </div>

        {/* 6. Use Cases Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Use Cases
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center">
              {tool.useCases && tool.useCases.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase}>{useCase}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-xs italic">Not specified</span>
              )}
            </div>
          ))}
        </div>

        {/* 7. Popularity Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-150 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Popularity
          </div>
          {tools.map((tool) => {
            const percentage = Math.min(Math.max((tool.popularityScore || 0) * 10, 0), 100);
            return (
              <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex flex-col justify-center gap-2">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Popularity Score</span>
                    <span className="font-semibold text-slate-800">{tool.popularityScore ? tool.popularityScore.toFixed(1) : "0.0"}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                <span className="text-xs text-slate-500">Views: <strong className="text-slate-700">{tool.views || 0}</strong></span>
              </div>
            );
          })}
        </div>

        {/* 8. Last Updated Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 align-stretch">
          <div className="p-4 md:p-6 font-semibold text-slate-700 text-sm bg-slate-50/30 md:bg-transparent border-r border-slate-200 flex items-center">
            Last Updated
          </div>
          {tools.map((tool) => {
            const formattedDate = tool.updatedAt
              ? new Date(tool.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Recently";
            return (
              <div key={tool.id} className="p-4 md:p-6 text-sm text-slate-800 border-r last:border-r-0 border-slate-200 flex items-center">
                <span className="text-xs text-slate-600">{formattedDate}</span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
