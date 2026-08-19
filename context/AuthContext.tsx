"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, updateProfile as fbUpdateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  loginWithGoogle as fbLoginWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  signupWithEmail as fbSignupWithEmail,
} from "@/lib/authProviders";
import { logout as fbLogout, syncUserWithBackend, BackendUser } from "@/lib/auth";
import { updateUserProfile as apiUpdateUserProfile } from "@/lib/api/user";

interface AuthContextType {
  user: User | null;
  backendUser: BackendUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<BackendUser>;
  loginWithEmail: (email: string, password: string) => Promise<BackendUser>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<BackendUser>;
  logout: () => Promise<void>;
  refreshBackendUser: () => Promise<BackendUser | null>;
  updateProfileName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBackendProfile = useCallback(async (): Promise<BackendUser | null> => {
    try {
      const data = await syncUserWithBackend();
      setBackendUser(data);
      return data;
    } catch (err) {
      console.warn("Failed to fetch backend profile:", err);
      setBackendUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchBackendProfile();
      } else {
        setBackendUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchBackendProfile]);

  const loginWithGoogle = async (): Promise<BackendUser> => {
    setLoading(true);
    try {
      await fbLoginWithGoogle();
      const profile = await syncUserWithBackend();
      setBackendUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<BackendUser> => {
    setLoading(true);
    try {
      await fbLoginWithEmail(email, password);
      const profile = await syncUserWithBackend();
      setBackendUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string,
    password: string,
    _name?: string
  ): Promise<BackendUser> => {
    setLoading(true);
    try {
      await fbSignupWithEmail(email, password);
      const profile = await syncUserWithBackend();
      setBackendUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileName = async (name: string): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name cannot be empty");

    // 1. Update backend MongoDB and in-memory cache
    const updatedProfile = await apiUpdateUserProfile(trimmed);

    // 2. Update Firebase Auth displayName
    if (auth.currentUser) {
      await fbUpdateProfile(auth.currentUser, { displayName: trimmed });
      setUser({ ...auth.currentUser });
    }

    // 3. Update local state
    setBackendUser((prev) =>
      prev
        ? { ...prev, name: updatedProfile.name }
        : {
            id: updatedProfile.id,
            firebaseUid: updatedProfile.firebaseUid,
            email: updatedProfile.email,
            name: updatedProfile.name,
            role: updatedProfile.role,
          }
    );
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fbLogout();
      setUser(null);
      setBackendUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        backendUser,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        refreshBackendUser: fetchBackendProfile,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

