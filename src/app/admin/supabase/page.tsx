import { Metadata } from "next";
import { requireAuth } from "@/lib/services/loaders.middleware";
import SupabasePlayground from "@/components/admin/SupabasePlayground";

export const metadata: Metadata = {
  title: "Supabase Playground",
};

export default async function SupabasePlaygroundPage() {
  await requireAuth();

  const supabaseConfig = {
    url: process.env.SUPABASE_API_URL,
    key: process.env.SUPABASE_ANON_PUBLIC_KEY,
  };

  return <SupabasePlayground supabaseConfig={supabaseConfig} />;
}
