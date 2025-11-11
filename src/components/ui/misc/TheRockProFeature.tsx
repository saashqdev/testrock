import Link from "next/link";

export default function TheRockProFeature() {
  return (
    <div className="border-border bg-background text-foreground rounded-md border-2 border-dashed py-6 text-center font-medium">
      <Link href="https://therock.com/pricing" target="_blank" className="underline">
        TheRock Pro 🚀 Feature
      </Link>
    </div>
  );
}
