import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SideNav from "@/components/SideNav";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackaboard - Collaborative Whiteboard",
  description: "Real-time collaborative whiteboard with secure rooms and persistent storage",
  keywords: ["whiteboard", "collaboration", "drawing", "real-time", "canvas"],
  icons: {
    icon: '/hackaboard.jpg',
    shortcut: '/hackaboard.jpg',
    apple: '/hackaboard.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SideNav />
          {children}
          <Footer/>
        </ThemeProvider>
      </body>
    </html>
  );
}