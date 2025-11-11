import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsVariablesIdApi } from "@/modules/workflowEngine/routes/workflow-engine/variables/variables.$id.api.server";
import WorkflowsVariablesIdView from "@/modules/workflowEngine/routes/workflow-engine/variables/variables.$id.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsVariablesIdApi.loader(props);
  // Convert MetaTagsDto array to Next.js Metadata object
  const metaTags = data?.metatags || [];
  return Array.isArray(metaTags) && metaTags[0]?.title 
    ? { title: metaTags[0].title } 
    : {};
}

export default async function WorkflowsVariablesIdPage(props: IServerComponentsProps) {
  try {
    const data = await WorkflowsVariablesIdApi.loader(props);
    return <WorkflowsVariablesIdView data={data} />;
  } catch (error) {
    return <ServerError />;
  }
}
