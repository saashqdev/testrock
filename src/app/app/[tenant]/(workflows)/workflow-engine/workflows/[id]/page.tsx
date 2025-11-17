import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.index.api.server";
import WorkflowsIdIndexView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import "reactflow/dist/style.css";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const metatags = data?.metatags || [];
  
  // Convert NextJS meta array format to Next.js Metadata object
  const metadata: Metadata = {};
  
  for (const tag of metatags) {
    if ('title' in tag) {
      metadata.title = tag.title;
    } else if ('name' in tag && 'content' in tag) {
      if (tag.name === 'description') {
        metadata.description = tag.content;
      }
    } else if ('property' in tag && 'content' in tag) {
      if (tag.property.startsWith('og:')) {
        if (!metadata.openGraph) metadata.openGraph = {};
        const key = tag.property.replace('og:', '');
        (metadata.openGraph as any)[key] = tag.content;
      } else if (tag.property.startsWith('twitter:')) {
        if (!metadata.twitter) metadata.twitter = {};
        const key = tag.property.replace('twitter:', '');
        (metadata.twitter as any)[key] = tag.content;
      }
    }
  }
  
  return metadata;
}

export default function WorkflowsIdIndexPage() {
  return <WorkflowsIdIndexView />;
}
