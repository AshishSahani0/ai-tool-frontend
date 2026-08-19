"use client";

import { useAuth } from "@/context/AuthContext";

export function useAuthState() {
  const { user, backendUser, loading, logout, refreshBackendUser, updateProfileName } = useAuth();

  return {
    user,
    backendUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: backendUser?.role === "ADMIN",
    logout,
    refreshBackendUser,
    updateProfileName,
  };
}