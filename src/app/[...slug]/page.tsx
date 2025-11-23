import Page404 from "@/components/pages/Page404";
import RedirectsService from "@/modules/redirects/RedirectsService";
import { headers } from "next/headers";

interface CatchAllPageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatchAllPage({ params, searchParams }: CatchAllPageProps) {
  // Await params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  // Get the request headers to construct the URL
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const pathname = resolvedParams.slug ? `/${resolvedParams.slug.join("/")}` : "/";

  // Construct search params string
  const searchParamsObj = new URLSearchParams();
  if (resolvedSearchParams) {
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParamsObj.append(key, v));
        } else {
          searchParamsObj.append(key, value);
        }
      }
    });
  }
  const searchString = searchParamsObj.toString();

  // Construct a Request object for compatibility with RedirectsService
  const url = `${protocol}://${host}${pathname}${searchString ? `?${searchString}` : ""}`;
  const request = new Request(url);

  try {
    // Attempt to find and redirect using the RedirectsService
    await RedirectsService.findAndRedirect({ request });
  } catch (error) {
    // If RedirectsService throws a redirect, it will be caught by Next.js
    // If it throws any other error, we'll continue to show 404
    throw error;
  }

  // If no redirect was found, show 404 page
  return <Page404 />;
}

// Generate metadata for the catch-all page
export async function generateMetadata() {
  return {
    title: "Page Not Found",
  };
}
