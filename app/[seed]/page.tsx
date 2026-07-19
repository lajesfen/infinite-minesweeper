import { Canvas } from "@/app/components/Canvas";
import { decodeSeed } from "@/app/lib/seed";
import { use } from "react";

export default function SeedPage({
  params,
}: {
  params: Promise<{ seed: string }>;
}) {
  const { seed } = use(params);
  return <Canvas seed={decodeSeed(seed)} />;
}
