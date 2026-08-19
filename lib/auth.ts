import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { apiFetch } from "./apiFetch";

export interface BackendUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: string;
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore backend failure on network disconnect
  } finally {
    await signOut(auth);
  }
}

/**
 * Sync Firebase user with backend
 * Returns backend user (id, firebaseUid, email, name, role)
 */
export async function syncUserWithBackend(): Promise<BackendUser> {
  return apiFetch<BackendUser>("/api/auth/me");
}