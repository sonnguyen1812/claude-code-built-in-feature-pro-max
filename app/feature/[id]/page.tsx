import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";
import FeatureDetail from "@/components/FeatureDetail";

export function generateStaticParams() {
  return FEATURES.map((f) => ({ id: f.id }));
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feature = FEATURES.find((f) => f.id === id);
  if (!feature) notFound();
  return <FeatureDetail feature={feature} />;
}
