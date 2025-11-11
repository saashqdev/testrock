import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogEditView from "@/modules/blog/routes/views/BlogRoutes.Edit.View";
import { BlogRoutesEditApi } from "@/modules/blog/routes/api/BlogRoutes.Edit.Api";

type Props = {
  params: Promise<{ tenant: string; entity: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  // Map entity param to id for the API
  return BlogRoutesEditApi.generateMetadata({ params: { ...resolvedParams, id: resolvedParams.entity } });
}

export default async function BlogEditPage({ params }: Props) {
  const resolvedParams = await params;
  
  try {
    // Create a mock request object for the loader
    const request = new Request(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/blog/${resolvedParams.entity}/edit`);
    // Map entity param to id for the API
    const data = await BlogRoutesEditApi.loader({ 
      request, 
      params: { ...resolvedParams, id: resolvedParams.entity } 
    });
    
    return <BlogEditView data={data} />;
  } catch (error) {
    notFound();
  }
}