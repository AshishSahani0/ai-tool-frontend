import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import { CompareTool } from "@/lib/api/compare";

type PageProps = {
  searchParams: Promise<{
    slugs?: string;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456";

async function getCompareTools(slugs?: string): Promise<CompareTool[]> {
  if (!slugs || slugs.trim() === "") return [];

  try {
    const res = await fetch(
      `${API_URL}/api/public/compare?slugs=${encodeURIComponent(slugs)}`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch comparison tools:", err);
  }
  return [];
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slugs } = await searchParams;
  const tools = await getCompareTools(slugs);

  if (!tools || tools.length === 0) {
    return {
      title: "Compare AI Tools Side-by-Side | AItoolHub",
      description:
        "Select and compare features, pricing, pros, cons, popularity and ratings of AI tools side-by-side.",
    };
  }

  const names = tools.map((t) => t.name).join(" vs ");
  return {
    title: `${names} - AI Tools Side-by-Side Comparison | AItoolHub`,
    description: `Detailed comparison between ${names}. Compare pricing models, feature matrices, user reviews, and pros & cons.`,
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { slugs } = await searchParams;
  const tools = await getCompareTools(slugs);

  return <CompareClient tools={tools} />;
}
