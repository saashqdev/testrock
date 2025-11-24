import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import * as WorkflowsIdRunManualApi from "@/modules/workflowEngine/routes/workflow-engine/(workflow)/workflows/[id]/run/manual/api/server";
import WorkflowsIdRunManualView from "@/modules/workflowEngine/routes/workflow-engine/(workflow)/workflows/[id]/run/workflows.$id.run.manual.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsIdRunManualApi.loader(props);
  if (data?.metatags && Array.isArray(data.metatags)) {
    const titleTag = data.metatags.find((tag: any) => tag.title);
    const descriptionTag = data.metatags.find((tag: any) => tag.name === "description");
    return {
      title: titleTag?.title || "Run Workflow Manually",
      description: descriptionTag?.content || "Execute workflow manually",
    };
  }
  return {
    title: "Run Workflow Manually",
    description: "Execute workflow manually",
  };
}

export default async function WorkflowsIdRunManualPage(props: IServerComponentsProps) {
  const params = await props.params;
  const data = await WorkflowsIdRunManualApi.loader(props);
  const workflowId = params?.id || "";

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
      const response = await WorkflowsIdRunManualApi.action({
        ...props,
        request: new Request(props.request?.url || `http://localhost/admin/workflow-engine/workflows/${workflowId}/run/manual`, {
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
      const response = await WorkflowsIdRunManualApi.action({
        ...props,
        request: new Request(props.request?.url || `http://localhost/admin/workflow-engine/workflows/${workflowId}/run/manual`, {
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
}

export function ErrorBoundary() {
  return <ServerError />;
}
