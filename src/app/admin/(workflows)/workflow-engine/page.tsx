import { Metadata } from "next";
import { WorkflowEngineApi } from "@/modules/workflowEngine/routes/workflow-engine.api.server";
import WorkflowEngineView from "@/modules/workflowEngine/routes/workflow-engine.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowEngineApi.loader(props);
  const title = data?.metatags?.[0] && "title" in data.metatags[0] ? data.metatags[0].title : "Workflow Engine";
  return { title };
}

export default async function WorkflowEnginePage(props: IServerComponentsProps) {
  const data = await WorkflowEngineApi.loader(props);
  return <WorkflowEngineView data={data} />;
}
