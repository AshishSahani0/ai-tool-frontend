// lib/api/categories.ts

export type Category = {
  id: string;
  name: string;
};

export type SubCategory = {
  id: string;
  name: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/public/categories`);
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export async function getSubCategories(
  categoryId: string
): Promise<SubCategory[]> {
  const res = await fetch(
    `${BASE}/api/public/categories/${categoryId}/subcategories`
  );
  if (!res.ok) throw new Error("Failed to load subcategories");
  return res.json();
}