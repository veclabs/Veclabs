import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Geist } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
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
  title: "VecLabs - The Vector Database for AI Agents",
  description:
    "Rust HNSW core. Solana on-chain Merkle proof after every write. 4.3ms p99. 88% cheaper than Pinecone.",
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
