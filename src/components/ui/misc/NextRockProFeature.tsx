import Link from "next/link";

export default function NextRockProFeature() {
  return (
    <div className="rounded-md border-2 border-dashed border-border bg-background py-6 text-center font-medium text-foreground">
      <Link href="https://nextrock.com/pricing" target="_blank" className="underline">
        NextRock Pro 🚀 Feature
      </Link>
    </div>
  );
}
