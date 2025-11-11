import { Metadata } from "next";
import { WorkflowsIndexApi } from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.api.server";
import WorkflowsIndexView from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsIndexApi.loader(props);
  return { title: data?.metatags?.[0]?.title || "Workflows" };
}

export default async function WorkflowsPage(props: IServerComponentsProps) {
  const data = await WorkflowsIndexApi.loader(props);
  return <WorkflowsIndexView data={data} />;
}
