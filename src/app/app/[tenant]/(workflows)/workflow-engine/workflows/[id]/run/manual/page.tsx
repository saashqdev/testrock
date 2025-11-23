import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader, action } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.manual.api.server";
import WorkflowsIdRunManualView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.manual.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data?.metatags?.[0]?.title || "Workflow",
  };
}

export default async function WorkflowsIdRunManualPage(props: IServerComponentsProps) {
  try {
    const data = await loader(props);
    const params = await props.params;

    // Define ActionData type to match what the view expects
    type ActionData = {
      success?: string;
      error?: string;
      execution?: any;
    };

    // Create wrapper functions for the actions
    const executeWorkflow = async (formData: FormData): Promise<ActionData> => {
      "use server";
      try {
        formData.set("action", "execute");
        const resolvedParams = await props.params;
        const response = await action({
          ...props,
          request: new Request(props.request?.url || `http://localhost/app/${resolvedParams?.tenant}/workflow-engine/workflows/${resolvedParams?.id}/run/manual`, {
            method: "POST",
            body: formData,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          const errorData = await response.json();
          return { error: typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error) || "An error occurred" };
        }
      } catch (error: any) {
        return { error: error?.message || error?.toString() || "An error occurred" };
      }
    };

    const continueWorkflowExecution = async (formData: FormData): Promise<ActionData> => {
      "use server";
      try {
        formData.set("action", "continue-execution");
        const resolvedParams = await props.params;
        const response = await action({
          ...props,
          request: new Request(props.request?.url || `http://localhost/app/${resolvedParams?.tenant}/workflow-engine/workflows/${resolvedParams?.id}/run/manual`, {
            method: "POST",
            body: formData,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          const errorData = await response.json();
          return { error: typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error) || "An error occurred" };
        }
      } catch (error: any) {
        return { error: error?.message || error?.toString() || "An error occurred" };
      }
    };

    return <WorkflowsIdRunManualView data={data} params={params} executeWorkflow={executeWorkflow} continueWorkflowExecution={continueWorkflowExecution} />;
  } catch (error) {
    return <ServerError />;
  }
}
