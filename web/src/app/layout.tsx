import type { Metadata } from "next";
import { Fira_Code, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VecLabs - Recall. Memory that thinks.",
  description:
    "The complete memory layer for AI agents. In-process vector search. Client-side encryption. Cryptographic proof after every write. 4.7ms p99.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${jetbrainsMono.variable} ${firaCode.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
