// lib/api/tools.ts

import { apiFetch } from "@/lib/apiFetch";

export type PricingType = "FREE" | "PAID" | "FREEMIUM";

export interface ToolPayload {
  name: string;
  website: string;
  shortDescription: string;
  longDescription: string;
  differentiation: string;
  logoKey: string;
  categoryId: string;
  subCategoryId: string;
  hashtags: string[];
  pricingType: PricingType;
  pricingDetails: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  uniqueFeatures: string[];
}

export async function submitTool(payload: ToolPayload) {
  return apiFetch("/api/user/tools", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}