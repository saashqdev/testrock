import { Metadata } from "next";
import BlogIndexView from "@/modules/blog/routes/views/BlogRoutes.Index.View";
import { BlogRoutesIndexApi } from "@/modules/blog/routes/api/BlogRoutes.Index.Api";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return BlogRoutesIndexApi.generateMetadata({ params: resolvedParams });
}

export default async function BlogIndexPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/blog`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  const request = new Request(url.toString());
  const data = await BlogRoutesIndexApi.loader({ 
    request, 
    params: resolvedParams 
  });
  
  return <BlogIndexView data={data} />;
}