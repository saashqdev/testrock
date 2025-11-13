import { Metadata } from "next";
import { WorkflowsIndexApi } from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.api.server";
import WorkflowsIndexView from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsIndexApi.loader(props);
  return { title: data?.metatags?.[0]?.title || "Workflows" };
}

// Server Action for handling form submissions
async function handleWorkflowAction(formData: FormData): Promise<WorkflowsIndexApi.ActionData | void> {
  "use server";
  
  const request = new Request("http://localhost", {
    method: "POST",
    body: formData,
  });
  
  const props: IServerComponentsProps = {
    params: Promise.resolve({}),
    searchParams: Promise.resolve({}),
    request,
  };
  
  try {
    const result = await WorkflowsIndexApi.action(props);
    // If action returns a Response object, extract the JSON data
    if (result instanceof Response) {
      return await result.json();
    }
    return result;
  } catch (error) {
    // Redirects throw, so we need to re-throw them
    throw error;
  }
}

export default async function WorkflowsPage(props: IServerComponentsProps) {
  const data = await WorkflowsIndexApi.loader(props);
  return <WorkflowsIndexView data={data} onAction={handleWorkflowAction} />;
}
