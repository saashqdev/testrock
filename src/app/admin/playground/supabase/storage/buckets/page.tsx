import { Metadata } from "next";
import { revalidatePath } from "next/cache";
import {
  deleteSupabaseBucket,
  getOrCreateSupabaseBucket,
  getSupabaseBuckets,
  getSupabaseFiles,
  updateSupabaseBucket,
} from "@/utils/integrations/supabaseService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import BucketsClient from "./buckets.client";

export const metadata: Metadata = {
  title: "Supabase Playground - Buckets",
};

type LoaderData = {
  buckets: {
    data: any[];
    error: any;
  };
  files: {
    [bucketId: string]: {
      data?: any[];
      error?: any;
    };
  };
  error?: string;
};

async function getData(): Promise<LoaderData> {
  await requireAuth();
  const data: LoaderData = {
    buckets: { data: [], error: null },
    files: {},
    error: "",
  };
  if (process.env.NODE_ENV !== "development") {
    data.error = "Not available in production";
  } else if (!process.env.SUPABASE_API_URL) {
    data.error = "Missing SUPABASE_API_URL .env variable";
  } else if (!process.env.SUPABASE_KEY) {
    data.error = "Missing SUPABASE_KEY .env variable (service_role, secret)";
  } else {
    const bucketsResult = await getSupabaseBuckets();
    data.buckets = {
      data: bucketsResult.data ?? [],
      error: bucketsResult.error,
    };
    if (bucketsResult.data) {
      await Promise.all(
        bucketsResult.data.map(async (bucket) => {
          const filesResult = await getSupabaseFiles(bucket.id);
          data.files[bucket.id] = {
            data: filesResult.data ?? undefined,
            error: filesResult.error,
          };
        })
      );
    }
  }
  return data;
}

async function createBucket(formData: FormData) {
  "use server";
  
  await requireAuth();
  
  if (process.env.NODE_ENV !== "development") {
    return { error: "Not available in production" };
  }
  
  const name = formData.get("name")?.toString();
  const isPublic = formData.get("public");
  
  if (!name) {
    return { error: "Missing name" };
  }
  
  await getOrCreateSupabaseBucket(name, isPublic === "true" || isPublic === "on");
  revalidatePath("/admin/playground/supabase/storage/buckets");
  return { success: "Bucket created" };
}

async function updateBucket(formData: FormData) {
  "use server";
  
  await requireAuth();
  
  if (process.env.NODE_ENV !== "development") {
    return { error: "Not available in production" };
  }
  
  const id = formData.get("id")?.toString();
  
  if (!id) {
    return { error: "Missing id" };
  }
  
  const isPublic = formData.get("public");
  await updateSupabaseBucket(id, {
    public: isPublic === "true" || isPublic === "on",
  });
  
  revalidatePath("/admin/playground/supabase/storage/buckets");
  return { success: "Bucket updated" };
}

async function deleteBucket(formData: FormData) {
  "use server";
  
  await requireAuth();
  
  if (process.env.NODE_ENV !== "development") {
    return { error: "Not available in production" };
  }
  
  const id = formData.get("id")?.toString();
  
  if (!id) {
    return { error: "Missing id" };
  }
  
  const bucketFiles = await getSupabaseFiles(id);
  if (bucketFiles.data?.length) {
    return { error: "Bucket is not empty" };
  }
  
  const deleted = await deleteSupabaseBucket(id);
  if (deleted.error) {
    return { error: deleted.error.name };
  }
  
  revalidatePath("/admin/playground/supabase/storage/buckets");
  return { success: "Bucket deleted" };
}

export default async function BucketsPage() {
  const data = await getData();

  return (
    <BucketsClient 
      data={data}
      createBucket={createBucket}
      updateBucket={updateBucket}
      deleteBucket={deleteBucket}
    />
  );
}
