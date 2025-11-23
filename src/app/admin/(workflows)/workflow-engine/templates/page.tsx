import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/templates.api.server";
import WorkflowsTemplatesView from "@/modules/workflowEngine/routes/workflow-engine/templates.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const metatags = data?.metatags?.[0];
  return {
    title: metatags?.title || "Workflow Templates",
  };
}

export default async function WorkflowTemplatesPage(props: IServerComponentsProps) {
  try {
    const data = await loader(props);
    return <WorkflowsTemplatesView />;
  } catch (error) {
    // If requireAuth throws a redirect, let it propagate
    throw error;
  }
}
