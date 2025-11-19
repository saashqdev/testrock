import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/index.api.server";
import WorkflowEngineIndexView from "@/modules/workflowEngine/routes/workflow-engine/index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const title = data?.metatags?.[0] && "title" in data.metatags[0] ? data.metatags[0].title : "Workflow Engine";
  return { title };
}

export default async function WorkflowEnginePage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <WorkflowEngineIndexView data={data} />;
}
