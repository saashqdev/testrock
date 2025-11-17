import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/variables/variables.new.api.server";
import WorkflowsVariablesNewView from "@/modules/workflowEngine/routes/workflow-engine/variables/variables.new.view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New Workflow Variable",
    description: "Create a new workflow variable",
  };
}

export default async function Page() {
  await loader({});
  return <WorkflowsVariablesNewView />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
