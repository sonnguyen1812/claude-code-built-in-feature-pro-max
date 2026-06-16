import { CATEGORIES, FEATURES } from "@/lib/features";
import Hero from "@/components/Hero";
import CatalogView from "@/components/CatalogView";

export default function Home() {
  return (
    <main>
      <Hero />
      <CatalogView categories={CATEGORIES} features={FEATURES} />
      <footer className="border-t-3 border-ink px-4 py-8 text-center text-sm md:px-8">
        Built with Next.js + GSAP · Data sourced from docs.anthropic.com
      </footer>
    </main>
  );
}
