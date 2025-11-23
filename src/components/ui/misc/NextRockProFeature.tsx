import Link from "next/link";

export default function NextRockProFeature() {
  return (
    <div className="border-border bg-background text-foreground rounded-md border-2 border-dashed py-6 text-center font-medium">
      <Link href="https://nextrock.com/pricing" target="_blank" className="underline">
        NextRock Pro 🚀 Feature
      </Link>
    </div>
  );
}
