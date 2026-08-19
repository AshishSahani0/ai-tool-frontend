"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Award,
  Sparkles,
  Check,
  X,
  Share2,
  Plus,
  Trash2,
  SlidersHorizontal,
  Search,
  Loader2,
  Layers,
  ArrowRight,
  RefreshCw,
  FileCode2,
} from "lucide-react";
import { useToast } from "@/components/toast/ToastContext";
import { useCompare } from "@/context/CompareContext";
import { CompareTool, searchToolsForCompare } from "@/lib/api/compare";

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

interface SearchToolItem {
  id: string;
  slug: string;
  name: string;
  logoKey?: string;
  rating: number;
  pricingType: string;
}

const POPULAR_PRESETS = [
  { label: "ChatGPT vs Claude", slugs: "chatgpt,claude" },
  { label: "Midjourney vs Leonardo AI", slugs: "midjourney,leonardo-ai" },
  { label: "Cursor vs GitHub Copilot", slugs: "cursor,github-copilot" },
  { label: "Canva vs Adobe Firefly", slugs: "canva,adobe-firefly" },
];

export default function CompareClient({ tools }: { tools: CompareTool[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { compareSlugs, addToCompare, removeFromCompare, clearCompare } =
    useCompare();

  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState<SearchToolItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTools, setLoadingTools] = useState(false);
  const [replaceTargetSlug, setReplaceTargetSlug] = useState<string | null>(
    null
  );

  // Sync compare slugs from URL into context if not already in context
  useEffect(() => {
    if (tools && tools.length > 0) {
      const toolSlugs = tools.map((t) => t.slug);
      toolSlugs.forEach((slug) => {
        if (!compareSlugs.includes(slug) && compareSlugs.length < 4) {
          // Sync context
        }
      });
    }
  }, [tools, compareSlugs]);

  // Load available tools for search modal
  const openSearchModal = async (replaceSlug?: string) => {
    setReplaceTargetSlug(replaceSlug || null);
    setSearchModalOpen(true);
    if (availableTools.length === 0) {
      setLoadingTools(true);
      try {
        const data = await searchToolsForCompare();
        setAvailableTools(data.content || []);
      } catch (err) {
        console.error("Failed to load tools for search modal:", err);
      } finally {
        setLoadingTools(false);
      }
    }
  };

  const handleSelectToolFromModal = (tool: SearchToolItem) => {
    let updatedSlugs = tools.map((t) => t.slug);

    if (replaceTargetSlug) {
      updatedSlugs = updatedSlugs.map((s) =>
        s === replaceTargetSlug ? tool.slug : s
      );
      removeFromCompare(replaceTargetSlug);
      addToCompare(tool.slug);
    } else {
      if (updatedSlugs.includes(tool.slug)) {
        showToast("Tool is already in comparison", "error");
        return;
      }
      if (updatedSlugs.length >= 4) {
        showToast("Maximum of 4 tools can be compared at once", "error");
        return;
      }
      updatedSlugs.push(tool.slug);
      addToCompare(tool.slug);
    }

    setSearchModalOpen(false);
    setSearchQuery("");
    setReplaceTargetSlug(null);
    router.push(`/compare?slugs=${updatedSlugs.join(",")}`);
  };

  const handleRemoveTool = (slugToRemove: string) => {
    const remainingSlugs = tools
      .map((t) => t.slug)
      .filter((s) => s !== slugToRemove);
    removeFromCompare(slugToRemove);
    if (remainingSlugs.length > 0) {
      router.push(`/compare?slugs=${remainingSlugs.join(",")}`);
    } else {
      router.push("/compare");
    }
    showToast("Removed from comparison", "info");
  };

  const handleShareLink = async () => {
    if (typeof window !== "undefined") {
      const shareData = {
        title: "AI Tools Side-by-Side Comparison",
        text: `Compare ${tools.map((t) => t.name).join(" vs ")} on AItoolHub`,
        url: window.location.href,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
        } catch {
          // Cancelled
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Comparison link copied to clipboard 📋", "success");
        } catch {
          showToast("Failed to copy link", "error");
        }
      }
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleCopyMarkdown = async () => {
    if (!tools || tools.length === 0) return;

    let md = `# AI Tools Side-by-Side Comparison\n\n`;
    md += `| Feature | ${tools.map((t) => `**${t.name}**`).join(" | ")} |\n`;
    md += `| --- | ${tools.map(() => "---").join(" | ")} |\n`;
    md += `| **Rating** | ${tools
      .map(
        (t) =>
          `★ ${t.rating ? t.rating.toFixed(1) : "N/A"} (${t.reviewsCount || 0} reviews)`
      )
      .join(" | ")} |\n`;
    md += `| **Pricing Model** | ${tools
      .map(
        (t) =>
          `${t.pricingType}${t.pricingDetails ? ` - ${t.pricingDetails}` : ""}`
      )
      .join(" | ")} |\n`;
    md += `| **Key Features** | ${tools
      .map((t) =>
        t.uniqueFeatures?.length ? t.uniqueFeatures.join(", ") : "N/A"
      )
      .join(" | ")} |\n`;
    md += `| **Pros** | ${tools
      .map((t) => (t.pros?.length ? t.pros.join(", ") : "N/A"))
      .join(" | ")} |\n`;
    md += `| **Cons** | ${tools
      .map((t) => (t.cons?.length ? t.cons.join(", ") : "N/A"))
      .join(" | ")} |\n`;
    md += `| **Website** | ${tools
      .map((t) => (t.website ? `[Visit Website](${t.website})` : "N/A"))
      .join(" | ")} |\n`;

    try {
      await navigator.clipboard.writeText(md);
      showToast("Comparison Markdown table copied to clipboard! 📋", "success");
    } catch {
      showToast("Failed to copy Markdown", "error");
    }
  };

  // Multi-Factor Winner Calculation with useMemo:
  // 40% Rating + 30% Popularity + 20% Reviews Volume + 10% Verified Status
  const winnerIndex = useMemo(() => {
    if (!tools || tools.length === 0) return -1;

    let bestIdx = -1;
    let maxScore = -1;

    tools.forEach((tool, index) => {
      const ratingScore = (tool.rating || 0) / 5;
      const popScore = Math.min(tool.popularityScore || 0, 100) / 100;
      const reviewScore = Math.min(tool.reviewsCount || 0, 50) / 50;
      const verifiedScore = tool.verified ? 1 : 0;

      const compositeScore =
        ratingScore * 0.4 +
        popScore * 0.3 +
        reviewScore * 0.2 +
        verifiedScore * 0.1;

      if (compositeScore > maxScore) {
        maxScore = compositeScore;
        bestIdx = index;
      }
    });

    return bestIdx;
  }, [tools]);

  const toolCount = tools.length;
  // Total grid columns = 1 (feature labels) + toolCount + (toolCount < 4 ? 1 : 0) for add button in header
  const totalCols = toolCount + 1 + (toolCount < 4 ? 1 : 0);
  const gridColClass =
    totalCols === 2
      ? "grid-cols-2"
      : totalCols === 3
      ? "grid-cols-3"
      : totalCols === 4
      ? "grid-cols-4"
      : "grid-cols-5";

  const rowGridClass =
    toolCount === 1
      ? "grid-cols-2"
      : toolCount === 2
      ? "grid-cols-3"
      : toolCount === 3
      ? "grid-cols-4"
      : "grid-cols-5";

  // Filtered tools in search modal
  const filteredModalTools = useMemo(() => {
    if (!searchQuery.trim()) return availableTools;
    const q = searchQuery.toLowerCase().trim();
    return availableTools.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [availableTools, searchQuery]);

  function renderSearchModal() {
    if (!searchModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-900 text-base">
                {replaceTargetSlug
                  ? "Select Replacement Tool"
                  : "Add Tool to Compare"}
              </h3>
            </div>
            <button
              onClick={() => {
                setSearchModalOpen(false);
                setSearchQuery("");
                setReplaceTargetSlug(null);
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b bg-slate-50">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tool name or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
            {loadingTools ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs">Loading available tools...</span>
              </div>
            ) : filteredModalTools.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No matching tools found.
              </div>
            ) : (
              filteredModalTools.map((item) => {
                const isAlreadySelected = tools.some(
                  (t) => t.slug === item.slug
                );
                const logoUrl = item.logoKey
                  ? `${R2_PUBLIC_URL}/${item.logoKey}`
                  : "/placeholder.png";

                return (
                  <div
                    key={item.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-2xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={logoUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-contain border bg-white shadow-2xs"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="text-amber-500 font-bold">
                            ★ {item.rating ? item.rating.toFixed(1) : "0.0"}
                          </span>
                          <span>•</span>
                          <span className="capitalize">
                            {item.pricingType.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectToolFromModal(item)}
                      disabled={
                        isAlreadySelected && item.slug !== replaceTargetSlug
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition"
                    >
                      {isAlreadySelected ? "In Comparison" : "Select"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (!tools || tools.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Layers size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Compare AI Tools Side-by-Side
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Select 2 to 4 AI tools to compare their features, capabilities,
            pricing models, verified ratings, and pros & cons side-by-side.
          </p>
        </div>

        <button
          onClick={() => openSearchModal()}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
        >
          <Plus size={18} />
          <span>Pick Tools to Compare</span>
        </button>

        {/* Popular Comparison Presets */}
        <div className="pt-8 border-t border-slate-200/80 w-full space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Popular 1v1 Comparisons
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {POPULAR_PRESETS.map((preset) => (
              <Link
                key={preset.label}
                href={`/compare?slugs=${preset.slugs}`}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition shadow-2xs"
              >
                {preset.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Tool Search Modal */}
        {renderSearchModal()}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="text-blue-600" /> AI Tools Comparison
              </h1>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
                {tools.length}/4 Tools
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Side-by-side feature matrix, pricing transparency, and real
              community feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Highlight Differences Toggle */}
            <button
              onClick={() => setHighlightDiffs(!highlightDiffs)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                highlightDiffs
                  ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Highlight Diffs</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition"
              title="Copy markdown comparison table"
            >
              <FileCode2 size={14} />
              <span>Copy Markdown</span>
            </button>

            {/* Add Tool Button */}
            {tools.length < 4 && (
              <button
                onClick={() => openSearchModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition"
              >
                <Plus size={14} />
                <span>Add Tool</span>
              </button>
            )}

            {/* Share Link */}
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition"
            >
              <Download size={14} />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Print Styles */}
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
            .print-container {
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}</style>

        {/* COMPARISON MATRIX CONTAINER */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-x-auto print-container">
          <div className="min-w-[720px]">
            {/* Table / Column Headers */}
            <div
              className={`grid ${gridColClass} border-b border-slate-200 bg-slate-50/70 sticky top-0 z-10`}
            >
              {/* Feature Labels Column */}
              <div className="p-6 flex flex-col justify-end font-bold text-slate-500 text-xs uppercase tracking-wider border-r border-slate-200">
                Evaluation Criteria
              </div>

              {/* Tool Columns */}
              {tools.map((tool, idx) => {
                const isWinner = idx === winnerIndex;
                const logoUrl = tool.logoKey
                  ? `${R2_PUBLIC_URL}/${tool.logoKey}`
                  : "/placeholder.png";

                return (
                  <div
                    key={tool.id}
                    className={`p-6 flex flex-col items-center text-center relative border-r last:border-r-0 border-slate-200 ${
                      isWinner ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* Winner Badge */}
                    {isWinner && (
                      <span className="absolute -top-1 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-b-xl flex items-center gap-1 shadow-2xs uppercase tracking-wider">
                        <Award size={11} /> Top Pick
                      </span>
                    )}

                    {/* Quick Action Top Bar (no-print) */}
                    <div className="no-print w-full flex justify-between items-center mb-2">
                      <button
                        onClick={() => openSearchModal(tool.slug)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition text-[11px] flex items-center gap-1 font-medium"
                        title="Replace tool"
                      >
                        <RefreshCw size={12} /> Replace
                      </button>
                      <button
                        onClick={() => handleRemoveTool(tool.slug)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Remove tool"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <img
                      src={logoUrl}
                      alt={tool.name}
                      className="w-14 h-14 rounded-2xl object-contain border bg-white shadow-2xs mb-3"
                    />

                    <h3 className="font-bold text-slate-900 text-base">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 px-2">
                      {tool.shortDescription}
                    </p>

                    {tool.website && (
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-3 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition"
                      >
                        <span>Website</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })}

              {/* Slot to add another tool if less than 4 */}
              {tools.length < 4 && (
                <div className="no-print p-6 flex flex-col items-center justify-center text-center border-r last:border-r-0 border-slate-200 bg-slate-50/30">
                  <button
                    onClick={() => openSearchModal()}
                    className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition mb-2"
                  >
                    <Plus size={20} />
                  </button>
                  <span className="text-xs font-semibold text-slate-600">
                    Add Competitor
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Up to 4 tools
                  </span>
                </div>
              )}
            </div>

            {/* 1. Ratings & Reviews */}
            <div className={`grid ${rowGridClass} border-b border-slate-200`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Ratings & Reviews
              </div>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-5 text-sm border-r last:border-r-0 border-slate-200 flex flex-col justify-center ${
                    highlightDiffs && tool.rating >= 4.5
                      ? "bg-emerald-50/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                    <span className="text-amber-500 text-lg">★</span>
                    <span>{tool.rating ? tool.rating.toFixed(1) : "0.0"}</span>
                    <span className="text-slate-400 text-xs font-normal">
                      / 5.0
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                    Based on {tool.reviewsCount || 0} user reviews
                  </span>
                </div>
              ))}
            </div>

            {/* 2. Pricing Tier & Details */}
            <div className={`grid ${rowGridClass} border-b border-slate-200`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Pricing Model
              </div>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-5 text-sm border-r last:border-r-0 border-slate-200 flex flex-col justify-center gap-1.5 ${
                    highlightDiffs && tool.pricingType === "FREE"
                      ? "bg-emerald-50/30"
                      : ""
                  }`}
                >
                  <span
                    className={`inline-block font-bold text-xs px-2.5 py-0.5 rounded-full w-fit ${
                      tool.pricingType === "FREE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : tool.pricingType === "FREEMIUM"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {tool.pricingType}
                  </span>
                  <p className="text-xs text-slate-500">
                    {tool.pricingDetails || "Standard pricing plans apply."}
                  </p>
                </div>
              ))}
            </div>

            {/* 3. Unique Capabilities */}
            <div className={`grid ${rowGridClass} border-b border-slate-200`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Key Features
              </div>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-5 text-sm border-r last:border-r-0 border-slate-200 flex flex-col justify-center gap-1.5"
                >
                  {tool.uniqueFeatures && tool.uniqueFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tool.uniqueFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      Not specified
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 4. Pros */}
            <div className={`grid ${rowGridClass} border-b border-slate-200`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Pros & Strengths
              </div>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-5 text-sm border-r last:border-r-0 border-slate-200 flex flex-col justify-center"
                >
                  {tool.pros && tool.pros.length > 0 ? (
                    <ul className="space-y-1.5">
                      {tool.pros.map((pro) => (
                        <li
                          key={pro}
                          className="flex items-start gap-1.5 text-xs text-slate-700 font-medium"
                        >
                          <Check
                            className="text-emerald-600 shrink-0 mt-0.5"
                            size={14}
                          />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      Not listed
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 5. Cons */}
            <div className={`grid ${rowGridClass} border-b border-slate-200`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Cons & Limitations
              </div>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-5 text-sm border-r last:border-r-0 border-slate-200 flex flex-col justify-center"
                >
                  {tool.cons && tool.cons.length > 0 ? (
                    <ul className="space-y-1.5">
                      {tool.cons.map((con) => (
                        <li
                          key={con}
                          className="flex items-start gap-1.5 text-xs text-slate-600"
                        >
                          <X className="text-red-500 shrink-0 mt-0.5" size={14} />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      Not listed
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 6. Popularity & Engagement */}
            <div className={`grid ${rowGridClass} border-b border-slate-200`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Community Popularity
              </div>
              {tools.map((tool) => {
                const percentage = Math.min(
                  Math.max((tool.popularityScore || 0) * 10, 0),
                  100
                );
                return (
                  <div
                    key={tool.id}
                    className="p-5 text-sm border-r last:border-r-0 border-slate-200 flex flex-col justify-center gap-2"
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                        <span>
                          Score:{" "}
                          {tool.popularityScore
                            ? tool.popularityScore.toFixed(1)
                            : "0.0"}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {tool.views || 0} views
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 7. Verification & Last Updated */}
            <div className={`grid ${rowGridClass}`}>
              <div className="p-5 font-semibold text-slate-700 text-xs uppercase tracking-wider bg-slate-50/40 border-r border-slate-200 flex items-center">
                Verification & Status
              </div>
              {tools.map((tool) => {
                const formattedDate = tool.updatedAt
                  ? new Date(tool.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently";

                return (
                  <div
                    key={tool.id}
                    className="p-5 text-sm border-r last:border-r-0 border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          tool.verified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tool.verified ? "Verified Tool" : "Standard"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formattedDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal */}
        {renderSearchModal()}
      </div>
    </main>
  );
}
