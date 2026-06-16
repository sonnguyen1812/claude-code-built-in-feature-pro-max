import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Cursor from "@/components/motion/Cursor";
import BackgroundFX from "@/components/motion/BackgroundFX";
import PageTransition from "@/components/motion/PageTransition";
import MotionHint from "@/components/motion/MotionHint";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Claude Code — Every Feature",
  description: "A bilingual showcase of the Claude Code CLI ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>
          <BackgroundFX />
          <Cursor />
          <PageTransition />
          <SmoothScroll>
            <Header />
            {children}
          </SmoothScroll>
          <MotionHint />
        </LanguageProvider>
      </body>
    </html>
  );
}
