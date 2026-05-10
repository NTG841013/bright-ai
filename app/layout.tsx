import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bright AI",
  description: "AI-powered system design canvas",
};

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: "var(--bg-base)",
    colorInputBackground: "var(--bg-surface)",
    colorNeutral: "var(--text-primary)",
    colorPrimary: "var(--accent-primary)",
    colorText: "var(--text-primary)",
    colorTextSecondary: "var(--text-secondary)",
    colorInputText: "var(--text-primary)",
    colorShimmer: "var(--bg-elevated)",
    fontFamily: "var(--font-geist-sans)",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
