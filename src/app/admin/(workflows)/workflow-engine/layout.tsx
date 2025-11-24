import { loader } from "@/modules/workflowEngine/routes/workflow-engine/api/server";
import WorkflowEngineView from "@/modules/workflowEngine/routes/view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function WorkflowEngineLayout(props: IServerComponentsProps) {
  const data = await loader(props);
  return <WorkflowEngineView data={{ ...data, children: props.children }} />;
}
