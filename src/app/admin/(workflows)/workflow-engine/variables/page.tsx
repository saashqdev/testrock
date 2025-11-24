import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/variables/api/server";
import WorkflowsVariablesView from "@/modules/workflowEngine/routes/workflow-engine/variables/view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return { title: data?.metatags?.[0]?.title || "Workflow Variables" };
}

export default async function WorkflowsVariablesPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <WorkflowsVariablesView data={data} />;
}
