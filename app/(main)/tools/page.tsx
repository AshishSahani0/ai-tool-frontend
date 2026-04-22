// app/tools/page.tsx
import ToolCategoryCard from "@/components/ToolCategoryCard";

import { publicFetch } from "@/lib/publicApi";

type Category = {
  id: string;
  name: string;
  imageKey: string | null;
};

type SubCategory = {
  id: string;
  name: string;
  toolCount: number;
};

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

export const metadata = {
  title: "AI Tools Directory – Discover AI Tools by Category",
  description:
    "Explore the best AI tools organized by category. Productivity, video, text, and business tools.",
};

export default async function ToolsPage() {
  const categories = await publicFetch<Category[]>(
    "/api/public/categories"
  );

  const subMap = await Promise.all(
    categories.map(async (c) => ({
      categoryId: c.id,
      subs: await publicFetch<SubCategory[]>(
        `/api/public/categories/${c.id}/subcategories`
      ),
    }))
  );

  return (
    <>
      {/* ✅ HERO (no spacer above) */}
      <section className="bg-gradient-to-b from-blue-50 to-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Find and compare the best AI tools in all categories
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Explore the best AI tools in all categories, carefully curated and compared to 
            help you make the right choice. Browse features, pricing, use cases, and real world benefits, all 
            in one place. Whether you're a beginner or a professional, find the perfect AI solution tailored to your needs
          </p>
        </div>
      </section>

      {/* ✅ CATEGORY GRID */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((c) => {
            const subs =
              subMap.find((s) => s.categoryId === c.id)?.subs || [];

            const imageUrl = c.imageKey
              ? `${R2_PUBLIC_URL}/${c.imageKey}`
              : "/placeholder.png";

            return (
              <ToolCategoryCard
                key={c.id}
                title={c.name}
                imageUrl={imageUrl}
                subCategories={subs}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}