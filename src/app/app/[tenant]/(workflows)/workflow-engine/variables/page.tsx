import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/variables/api/server";
import WorkflowsVariablesView from "@/modules/workflowEngine/routes/workflow-engine/variables/view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return (
    (data?.metatags as Metadata) ||
    ({
      title: "Workflow Variables",
      description: "Manage workflow variables",
    } as Metadata)
  );
}

export default async function WorkflowVariablesPage(props: IServerComponentsProps) {
  try {
    const data = await loader(props);
    return <WorkflowsVariablesView data={data} />;
  } catch (error) {
    return <ServerError />;
  }
}
