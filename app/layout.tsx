import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { LanguageProvider } from "@/src/providers/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dad Coach",
  description: "Your partner on the path of fatherhood",
};

/**
 * RootLayout — HTML shell and global providers for the Dad Coach application.
 *
 * Provider Hierarchy (from design.md):
 * ```
 * app/layout.tsx (RootLayout)
 * └── LanguageProvider (language/RTL context)
 *     └── QueryProvider (TanStack Query context)
 *         └── AuthProvider (authentication context + redirect logic)
 *             └── app/(workspace)/layout.tsx (WorkspaceLayout)
 * ```
 *
 * LanguageProvider is outermost so it can set document attributes.
 * QueryProvider wraps AuthProvider because auth hooks may need query cache access.
 *
 * Requirements covered:
 * - 1.2, 17.1: Data fetching infrastructure via QueryProvider
 * - 8.2: RTL support via LanguageProvider
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <QueryProvider>{children}</QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
