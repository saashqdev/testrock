import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsDangerApi } from "@/modules/workflowEngine/routes/workflow-engine/danger.api.server";
import WorkflowsDangerView from "@/modules/workflowEngine/routes/workflow-engine/danger.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsDangerApi.loader(props);
  
  // Convert MetaTagsDto array to Next.js Metadata format
  const metadata: Metadata = {};
  
  if (data?.metatags && Array.isArray(data.metatags)) {
    data.metatags.forEach((tag: any) => {
      if ('title' in tag) {
        metadata.title = tag.title;
      } else if ('name' in tag && tag.name === 'description') {
        metadata.description = tag.content;
      }
    });
  }
  
  return metadata;
}

export default async function DangerPage(props: IServerComponentsProps) {
  try {
    const data = await WorkflowsDangerApi.loader(props);
    return <WorkflowsDangerView data={data} />;
  } catch (error) {
    return <ServerError />;
  }
}
