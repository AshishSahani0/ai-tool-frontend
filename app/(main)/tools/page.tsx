// app/tools/page.tsx
import ToolCategoryCard from "@/components/ToolCategoryCard";
import { publicFetch } from "@/lib/publicApi";
import { Sparkles, Layers } from "lucide-react";

type SubCategory = {
  id: string;
  name: string;
  toolCount: number;
};

type CategoryWithSubs = {
  id: string;
  name: string;
  imageKey: string | null;
  subCategories: SubCategory[];
};

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Tools Directory – Discover AI Tools by Category | AItoolHub",
  description:
    "Explore the best AI tools organized by category. Productivity, video, text, audio, developer tools, and business AI solutions.",
};

export default async function ToolsPage() {
  let categories: CategoryWithSubs[] = [];

  try {
    categories = await publicFetch<CategoryWithSubs[]>(
      "/api/public/categories/full"
    );
  } catch (err) {
    console.error("Failed to load categories:", err);
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* HERO */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 py-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/80 mb-2">
            <Sparkles size={13} />
            <span>Curated Directory</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto">
            Find and Compare the Best AI Tools in All Categories
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Explore verified AI tools across dozens of specialized categories. Browse features, pricing models, verified ratings, and side-by-side comparisons to find the perfect tool for your workflow.
          </p>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        {categories.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Layers size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Loading Categories...
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Categories are being synchronized with the directory index.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((c) => {
              const imageUrl = c.imageKey
                ? `${R2_PUBLIC_URL}/${c.imageKey}`
                : "/placeholder.png";

              return (
                <ToolCategoryCard
                  key={c.id}
                  title={c.name}
                  imageUrl={imageUrl}
                  subCategories={c.subCategories || []}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}