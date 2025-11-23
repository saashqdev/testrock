import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/templates.api.server";
import WorkflowsTemplatesView from "@/modules/workflowEngine/routes/workflow-engine/templates.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);

  // Convert array-based MetaTagsDto to Next.js Metadata format
  if (!data?.metatags || !Array.isArray(data.metatags)) {
    return {};
  }

  const metadata: Metadata = {};

  data.metatags.forEach((tag: any) => {
    if (tag.title) {
      metadata.title = tag.title;
    } else if (tag.name === "description") {
      metadata.description = tag.content;
    } else if (tag.name === "keywords") {
      metadata.keywords = tag.content;
    } else if (tag.property === "og:title") {
      metadata.openGraph = metadata.openGraph || {};
      metadata.openGraph.title = tag.content;
    } else if (tag.property === "og:description") {
      metadata.openGraph = metadata.openGraph || {};
      metadata.openGraph.description = tag.content;
    } else if (tag.property === "og:image") {
      metadata.openGraph = metadata.openGraph || {};
      metadata.openGraph.images = [{ url: tag.content }];
    }
  });

  return metadata;
}

export default function WorkflowsTemplatesPage() {
  return <WorkflowsTemplatesView />;
}
