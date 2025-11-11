import { Metadata } from "next";
import { getSupabaseFiles } from "@/utils/integrations/supabaseService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import ServerError from "@/components/ui/errors/ServerError";
import { BucketFilesClient } from "../../BucketFilesClient";

export const metadata: Metadata = {
  title: "Supabase Playground - Files",
};

type LoaderData = {
  files: Awaited<ReturnType<typeof getSupabaseFiles>>;
  error?: string;
};

async function getLoaderData(bucketId: string): Promise<LoaderData> {
  await requireAuth();
  const data: LoaderData = {
    files: { data: [], error: null },
    error: "",
  };
  if (process.env.NODE_ENV !== "development") {
    data.error = "Not available in production";
  } else if (!process.env.SUPABASE_API_URL) {
    data.error = "Missing SUPABASE_API_URL .env variable";
  } else if (!process.env.SUPABASE_KEY) {
    data.error = "Missing SUPABASE_KEY .env variable (service_role, secret)";
  } else {
    data.files = await getSupabaseFiles(bucketId);
  }
  return data;
}

type SupabaseFileDto = { id: string; name: string };
export default async function BucketFilesPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const bucketId = params.id!;
  const data = await getLoaderData(bucketId);

  return <BucketFilesClient initialData={data} bucketId={bucketId} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
