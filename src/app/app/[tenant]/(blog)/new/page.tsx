import { Metadata } from "next";
import BlogNewView from "@/modules/blog/routes/views/BlogRoutes.New.View";
import { generateMetadata as generateBlogMetadata, loader } from "@/modules/blog/routes/api/BlogRoutes.New.Api";

type Props = {
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return generateBlogMetadata({ params: Promise.resolve(resolvedParams) });
}

export default async function BlogNewPage({ params }: Props) {
  const resolvedParams = await params;
  
  // Create a mock request object for the loader
  const request = new Request(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/blog/new`);
  const data = await loader({ 
    request, 
    params: resolvedParams 
  });
  
  return <BlogNewView data={data} />;
}