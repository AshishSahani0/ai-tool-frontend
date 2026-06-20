const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function publicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {

    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.error ||
        `PUBLIC_API_ERROR_${res.status}`
      );
    }

    return data as T;

  } catch (err) {

    console.error("publicFetch failed:", err);

    if (err instanceof Error) {
      throw new Error(err.message);
    }

    throw new Error("Unknown API Error");

  } finally {
    clearTimeout(timeout);
  }
}