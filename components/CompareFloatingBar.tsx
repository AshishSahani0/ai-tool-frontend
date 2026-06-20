"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare } from "@/context/CompareContext";
import { X, ArrowRight, Trash2 } from "lucide-react";

export default function CompareFloatingBar() {
  const { compareSlugs, removeFromCompare, clearCompare } = useCompare();
  const pathname = usePathname();

  const hiddenPaths = ["/settings", "/my-tools", "/profile", "/login", "/signup"];

  if (compareSlugs.length === 0 || hiddenPaths.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slideIn">
      {/* Container with premium glassmorphism and subtle shadow */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-5 max-w-sm w-80 md:w-96 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <h4 className="text-sm font-semibold text-slate-800">Compare Tools</h4>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
            {compareSlugs.length}/3
          </span>
        </div>

        {/* Slugs List */}
        <div className="flex flex-col gap-2">
          {compareSlugs.map((slug) => (
            <div
              key={slug}
              className="flex justify-between items-center bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 transition"
            >
              <span className="font-medium truncate capitalize">
                {slug.replace("-", " ")}
              </span>
              <button
                onClick={() => removeFromCompare(slug)}
                className="text-slate-400 hover:text-red-500 hover:bg-slate-100 p-1 rounded-lg transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center">
          <button
            onClick={clearCompare}
            className="flex items-center justify-center p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-xl transition duration-300"
            title="Clear list"
          >
            <Trash2 size={16} />
          </button>
          
          <Link
            href={`/compare?slugs=${compareSlugs.join(",")}`}
            className="flex-1 flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-semibold shadow-md hover:shadow-lg transition duration-300"
          >
            <span>Compare Now</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
