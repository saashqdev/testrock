import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader as workflowExecutionsLoader } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.executions.api.server";
import WorkflowsIdExecutionsView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.executions.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import "reactflow/dist/style.css";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const data = await workflowExecutionsLoader(props);
    return {
      title: data?.metatags?.[0]?.title || "Workflow Executions",
      description: data?.metatags?.[0]?.description,
      // Add other metadata fields as needed
    };
  } catch (error) {
    return {
      title: "Workflow Executions",
      description: "Workflow execution details",
    };
  }
}

// export const action = (args: ActionFunctionArgs) => WorkflowsIdExecutionsApi.action(args);

export default () => <WorkflowsIdExecutionsView />;

export function ErrorBoundary() {
  return <ServerError />;
}
