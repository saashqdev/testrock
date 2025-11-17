import type { Metadata } from "next";
import { generateMetadata, loader } from "@/modules/blog/routes/api/BlogRoutes.Index.Api";
import BlogView from "@/modules/blog/routes/views/BlogRoutes.Index.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const params = (await props.params) || {};
    return await generateMetadata({ params });
  } catch (error) {
    return {};
  }
}

export default async function BlogPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  const data = await loader({ request, params });
  
  return <BlogView data={data} />;
}
