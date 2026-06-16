import { CATEGORIES, FEATURES } from "@/lib/features";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";

export default function Home() {
  return (
    <main>
      <Hero />
      {CATEGORIES.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          features={FEATURES.filter((f) => f.category === cat.id)}
        />
      ))}
      <footer className="border-t-3 border-ink px-4 py-8 text-center text-sm md:px-8">
        Built with Next.js + GSAP · Data sourced from docs.anthropic.com
      </footer>
    </main>
  );
}
