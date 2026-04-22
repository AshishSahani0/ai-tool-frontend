const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function publicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      data?.error || `PUBLIC_API_ERROR_${res.status}`
    );
  }

  return data as T;
}