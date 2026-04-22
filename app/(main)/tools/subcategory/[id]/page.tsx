import { notFound } from "next/navigation";

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

// Fetch helper
async function getSubCategory(id: string): Promise<SubCategory | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/public/subcategories/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

// ✅ Metadata
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;   // 🔥 MUST await
  const sub = await getSubCategory(id);

  if (!sub) {
    return { title: "AI Tools | AItoolHub" };
  }

  return {
    title: `${sub.name} AI Tools | AItoolHub`,
    description: `Explore the best ${sub.name} AI tools`,
  };
}

// ✅ Page Component
export default async function SubCategoryToolsPage({
  params,
}: PageProps) {

  const { id } = await params;   // 🔥 MUST await
  const sub = await getSubCategory(id);

  if (!sub) {
    notFound();
  }

  return (
    <>
    
      <section className="py-10">
  <div className="bg-gradient-to-b from-blue-50 to-slate-50 max-w-3xl mx-auto rounded-2xl px-8 py-8 text-center shadow-sm">
    <h1 className="text-2xl font-semibold">
      {"AI Tools for " + sub.name}
    </h1>
  </div>
</section>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <ToolsListWithPagination subCategoryId={id} />
      </main>
    </>
  );
}