import { apiFetch } from "@/lib/apiFetch";

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
  submittedToolsCount: number;
  approvedToolsCount: number;
  reviewsCount: number;
}

export interface UpdateProfilePayload {
  name: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/user/profile");
}

export async function updateUserProfile(name: string): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export async function exportUserData(): Promise<any> {
  return apiFetch<any>("/api/user/export");
}
