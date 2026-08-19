import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Wait for Firebase to finish restoring persistent credentials
  if (typeof window !== "undefined" && typeof auth.authStateReady === "function") {
    await auth.authStateReady();
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  // ✅ Use cached ID token (refreshed automatically by Firebase when expired)
  const token = await user.getIdToken(false);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      // Don't immediately sign out on single 401 unless confirmed invalid session
      throw new Error(data?.message || "UNAUTHORIZED");
    }

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `API_ERROR_${res.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("REQUEST_TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
