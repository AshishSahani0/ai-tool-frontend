import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { apiFetch } from "./apiFetch";

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore backend failure
  } finally {
    await signOut(auth);
  }
}

/**
 * Sync Firebase user with backend
 * Returns backend user (email + role)
 */
export async function syncUserWithBackend() {
  return apiFetch<{
    email: string;
    role: string;
  }>("/api/auth/me");
}