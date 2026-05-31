import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revenue Goal Tracker",
  description:
    "Track your personal income, expenses, and monthly financial goals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning on <html> prevents false-positive warnings from
    // browser extensions that inject attributes (e.g. Grammarly, LastPass).
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-950 text-white antialiased`}
        // suppressHydrationWarning on <body> for the same reason — extensions
        // sometimes inject data-* attributes before React hydrates.
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
