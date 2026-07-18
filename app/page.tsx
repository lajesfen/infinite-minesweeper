import { encodeSeed, randomSeed } from "@/app/lib/seed";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  redirect(`/${encodeSeed(randomSeed())}`);
}
