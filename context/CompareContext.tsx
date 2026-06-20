"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/toast/ToastContext";

type CompareContextType = {
  compareSlugs: string[];
  addToCompare: (slug: string) => void;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isComparing: (slug: string) => boolean;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compare_slugs");
    if (saved) {
      try {
        setCompareSlugs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved compare slugs", e);
      }
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever compareSlugs changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("compare_slugs", JSON.stringify(compareSlugs));
    }
  }, [compareSlugs, mounted]);

  const addToCompare = (slug: string) => {
    if (compareSlugs.includes(slug)) {
      showToast("Tool is already in comparison list", "error");
      return;
    }

    if (compareSlugs.length >= 3) {
      showToast("Maximum of 3 tools can be compared at once", "error");
      return;
    }

    setCompareSlugs((prev) => [...prev, slug]);
    showToast("Added to comparison list", "success");
  };

  const removeFromCompare = (slug: string) => {
    setCompareSlugs((prev) => prev.filter((s) => s !== slug));
    showToast("Removed from comparison list", "success");
  };

  const clearCompare = () => {
    setCompareSlugs([]);
    showToast("Cleared comparison list", "success");
  };

  const isComparing = (slug: string) => {
    return compareSlugs.includes(slug);
  };

  return (
    <CompareContext.Provider
      value={{
        compareSlugs,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
