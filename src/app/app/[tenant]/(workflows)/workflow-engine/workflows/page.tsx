import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsIndexApi } from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.api.server";
import WorkflowsIndexView from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsIndexApi.loader(props);
  // Convert MetaTagsDto array to Next.js Metadata object
  const titleMeta = data?.metatags?.find((tag: any) => tag.title);
  return {
    title: titleMeta?.title || "Workflows"
  };
}

export default async function WorkflowsPage(props: IServerComponentsProps) {
  try {
    const data = await WorkflowsIndexApi.loader(props);
    return <WorkflowsIndexView data={data} />;
  } catch (error) {
    return <ServerError />;
  }
}
