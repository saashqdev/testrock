import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/blog/routes/api/BlogRoutes.Edit.Api";
import BlogEditView from "@/modules/blog/routes/views/BlogRoutes.Edit.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const params = (await props.params) || {};
    const request = props.request!;
    const data = await loader({ request, params });
    
    // Convert MetaTagsDto array to Metadata object
    const metadata: Metadata = {};
    if (data?.metatags) {
      for (const tag of data.metatags) {
        if ("title" in tag) {
          metadata.title = tag.title;
        } else if ("name" in tag && "content" in tag) {
          if (tag.name === "description") {
            metadata.description = tag.content;
          }
        }
      }
    }
    return metadata;
  } catch (error) {
    return {};
  }
}

export default async function BlogEditPage(props: IServerComponentsProps) {
  try {
    const params = (await props.params) || {};
    const request = props.request!;
    const data = await loader({ request, params });
    return <BlogEditView data={data} />;
  } catch (error) {
    notFound();
  }
}

export function ErrorBoundary() {
  return <ServerError />;
}
