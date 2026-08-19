import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast/ToastContext";
import { CompareProvider } from "@/context/CompareContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AItoolHub",
  description: "Explore the best AI tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <CompareProvider>
              {children}
            </CompareProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}