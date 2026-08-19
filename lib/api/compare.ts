import { publicFetch } from "@/lib/publicApi";

export type PricingType = "FREE" | "PAID" | "FREEMIUM";

export interface CompareTool {
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
}

export async function fetchComparisonTools(slugs: string[]): Promise<CompareTool[]> {
  if (!slugs || slugs.length === 0) return [];
  const params = encodeURIComponent(slugs.join(","));
  return publicFetch<CompareTool[]>(`/api/public/compare?slugs=${params}`);
}

export async function searchToolsForCompare(): Promise<{ content: Array<{ id: string; slug: string; name: string; logoKey?: string; rating: number; pricingType: string }> }> {
  return publicFetch(`/api/public/tools?page=0&size=100`);
}
