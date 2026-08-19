import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import ToolsListWithPagination from "./ToolsListWithPagination";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SubCategory = {
  id: string;
  name: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456";

// Fetch helper
async function getSubCategory(id: string): Promise<SubCategory | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/subcategories/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const sub = await getSubCategory(id);

  if (!sub) {
    return { title: "AI Tools Directory | AItoolHub" };
  }

  return {
    title: `${sub.name} AI Tools & Software – Top Picks & Alternatives | AItoolHub`,
    description: `Discover, filter, and compare the top-rated AI tools for ${sub.name}. Verified reviews, pricing, and feature breakdowns.`,
  };
}

// Page Component
export default async function SubCategoryToolsPage({
  params,
}: PageProps) {
  const { id } = await params;
  const sub = await getSubCategory(id);

  if (!sub) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* HEADER & BREADCRUMBS */}
      <section className="bg-gradient-to-b from-blue-50/70 to-slate-50/30 border-b border-slate-200/70 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-4">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/tools" className="hover:text-slate-900 transition">
              Categories
            </Link>
            <ChevronRight size={13} />
            <span className="text-slate-900 font-semibold">{sub.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-2">
                <Sparkles size={12} />
                <span>AI Subcategory</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Top AI Tools for {sub.name}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Browse verified platforms, compare real pricing tiers, and find the perfect {sub.name} software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LIST SECTION */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <ToolsListWithPagination subCategoryId={id} />
      </main>
    </div>
  );
}