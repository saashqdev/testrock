import { Metadata } from "next";
import Link from "next/link";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";

export const metadata: Metadata = {
  title: "Supabase Playground",
};

export default function SupabaseStoragePage() {
  return (
    <IndexPageLayout title="Supabase Playground">
      <div className="grid gap-4">
        <Link
          href={`/admin/playground/supabase/storage/buckets`}
          className="focus:outline-hidden relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-border focus:border-2 focus:border-gray-600 focus:bg-background"
        >
          <div className="block text-sm font-medium text-foreground">Buckets</div>
          <div className="block text-xs text-muted-foreground">Storage files in buckets</div>
        </Link>
      </div>
    </IndexPageLayout>
  );
}
