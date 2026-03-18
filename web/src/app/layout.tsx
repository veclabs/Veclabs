import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const sans = Geist({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Recall by VecLabs — Memory that thinks.",
  description:
    "The complete memory layer for AI agents. Rust HNSW. AES-256-GCM encryption. SHA-256 Merkle root on Solana. 4.7ms p99 at 100K vectors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mono.variable} ${sans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
