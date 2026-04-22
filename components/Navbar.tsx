"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { logout } from "@/lib/auth";

export default function Navbar() {
  const { user } = useAuthState(); 
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    setMenuOpen(false);
  }, []);

  return (
    <>
      {/* ===== TOP NAVBAR ===== */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* Brand */}
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            AItoolHub
          </Link>

          {/* ===== DESKTOP LINKS ===== */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/tools" className="text-sm font-medium text-gray-700 hover:text-black">
              AI Tools
            </Link>

            {user && (
              <Link
                href="/my-tools"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                My Submitted Tools
              </Link>
            )}

            <Link href="/add-tool" className="text-sm font-medium text-gray-700 hover:text-black">
              Add Tool
            </Link>
          </div>

          {/* ===== DESKTOP RIGHT ===== */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <Link
                href="/login"
                className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Login
              </Link>
            ) : (
              <Link
                href="/settings"
                title="Profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                {user.email?.[0]?.toUpperCase() || "U"}
              </Link>
            )}
          </div>

          {/* ===== MOBILE TOGGLE ===== */}
          <button
            className="md:hidden flex flex-col gap-[5px]"
            onClick={() => setMenuOpen(true)}
          >
            <span className="w-6 h-[2px] bg-black" />
            <span className="w-6 h-[2px] bg-black" />
            <span className="w-6 h-[2px] bg-black" />
          </button>
        </div>
      </nav>

      {/* ===== MOBILE OVERLAY ===== */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ===== MOBILE DRAWER ===== */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[300px] bg-white shadow-xl transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setMenuOpen(false)} className="text-2xl">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <Link href="/tools" onClick={() => setMenuOpen(false)}>
            AI Tools
          </Link>

          {user && (
            <Link href="/my-tools" onClick={() => setMenuOpen(false)}>
              My Submitted Tools
            </Link>
          )}

          <Link href="/add-tool" onClick={() => setMenuOpen(false)}>
            Add Tool
          </Link>

          <hr />

          {!user ? (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-black px-5 py-3 text-center font-semibold text-white"
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 font-semibold">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span>Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="mt-4 rounded-xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}