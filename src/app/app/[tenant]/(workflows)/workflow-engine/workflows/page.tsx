import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsIndexApi } from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.api.server";
import WorkflowsIndexView from "@/modules/workflowEngine/routes/workflow-engine/workflows.index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsIndexApi.loader(props);
  // Convert MetaTagsDto array to Next.js Metadata object
  const titleMeta = data?.metatags?.find((tag: any) => tag.title);
  return {
    title: titleMeta?.title || "Workflows"
  };
}

export default async function WorkflowsPage(props: IServerComponentsProps) {
  try {
    const data = await WorkflowsIndexApi.loader(props);
    
    // Server Action for handling form submissions
    async function handleWorkflowAction(formData: FormData): Promise<WorkflowsIndexApi.ActionData | void> {
      "use server";
      
      const request = new Request("http://localhost", {
        method: "POST",
        body: formData,
      });
      
      const actionProps: IServerComponentsProps = {
        params: props.params,
        searchParams: props.searchParams,
        request,
      };
      
      try {
        const result = await WorkflowsIndexApi.action(actionProps);
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
    
    return <WorkflowsIndexView data={data} onAction={handleWorkflowAction} />;
  } catch (error) {
    return <ServerError />;
  }
}
