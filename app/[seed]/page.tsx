import { Canvas } from "@/app/components/Canvas";
import { decodeSeed } from "@/app/lib/seed";

export default function SeedPage({ params }: { params: { seed: string } }) {
  return <Canvas seed={decodeSeed(params.seed)} />;
}
