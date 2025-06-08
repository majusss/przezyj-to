import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Logged from "@/components/logged";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Przezyj.to",
  description: "Czy uda ci się przeżyć?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${geistSans.variable} antialiased`}>
        <Logged />
        {children}
      </body>
    </html>
  );
}
