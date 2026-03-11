import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Memory Demo - VecLabs",
  description:
    "Live demo of VecLabs agent memory. Every message stored as a vector with a Merkle root posted to Solana devnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#000000" }}>
        {children}
      </body>
    </html>
  );
}