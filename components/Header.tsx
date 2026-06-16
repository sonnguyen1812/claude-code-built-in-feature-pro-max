"use client";
import Link from "next/link";
import LangToggle from "./LangToggle";
import Magnetic from "./motion/Magnetic";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b-3 border-ink bg-paper px-4 py-3 md:px-8">
      <Magnetic>
        <Link href="/" className="text-xl font-black tracking-tight">
          CLAUDE<span className="text-brand">·</span>CODE
        </Link>
      </Magnetic>
      <Magnetic>
        <LangToggle />
      </Magnetic>
    </header>
  );
}
