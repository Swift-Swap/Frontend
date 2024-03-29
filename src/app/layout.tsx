import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Nav from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { roboto } from "@/lib/utils";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "SwiftSwap",
  description: "SwiftSwap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={roboto.className}>
          <Providers>
            <main className="w-screen h-screen bg-background max-w-full overflow-x-hidden flex flex-col">
              <Nav />
              {children}
              <Analytics />
              <Toaster />
            </main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
