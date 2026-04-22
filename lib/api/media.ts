// lib/api/media.ts

import { auth } from "@/lib/firebase";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function uploadToolLogo(file: File): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  const token = await auth.currentUser.getIdToken();

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BASE}/api/user/media/tool-logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  if (!res.ok) {
    throw new Error("Logo upload failed");
  }

  const data = await res.json();
  return data.key;
}