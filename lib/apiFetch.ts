import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  // ✅ Do NOT force refresh every time
  const token = await user.getIdToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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
      await auth.signOut();
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      throw new Error(
        data?.error || `API_ERROR_${res.status}`
      );
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