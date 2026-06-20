import CompareClient from "./CompareClient";

type PageProps = {
  searchParams: Promise<{
    slugs?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare AI Tools | AItoolHub",
  description: "Compare features, pricing, pros, cons, and ratings of AI tools side-by-side.",
};

export default async function ComparePage({ searchParams }: PageProps) {
  const { slugs } = await searchParams;

  if (!slugs || slugs.trim() === "") {
    return <CompareClient tools={[]} />;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456";

  let tools = [];
  try {
    const res = await fetch(
      `${API_URL}/api/public/compare?slugs=${encodeURIComponent(slugs)}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      tools = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch comparison tools:", err);
  }

  return <CompareClient tools={tools} />;
}
