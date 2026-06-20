import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast/ToastContext";
import { CompareProvider } from "@/context/CompareContext";

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
        <ToastProvider>
          <CompareProvider>
            {children}
          </CompareProvider>
        </ToastProvider>
      </body>
    </html>
  );
}