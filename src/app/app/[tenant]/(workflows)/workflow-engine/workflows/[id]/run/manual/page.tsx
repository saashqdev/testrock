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
        const response = await action(props);
        
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          const errorData = await response.json();
          return { error: errorData.error || "An error occurred" };
        }
      } catch (error: any) {
        return { error: error.message || "An error occurred" };
      }
    };

    const continueWorkflowExecution = async (formData: FormData): Promise<ActionData> => {
      "use server";
      try {
        formData.set("action", "continue-execution");
        const response = await action(props);
        
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          const errorData = await response.json();
          return { error: errorData.error || "An error occurred" };
        }
      } catch (error: any) {
        return { error: error.message || "An error occurred" };
      }
    };

    return (
      <WorkflowsIdRunManualView 
        data={data} 
        params={params} 
        executeWorkflow={executeWorkflow}
        continueWorkflowExecution={continueWorkflowExecution}
      />
    );
  } catch (error) {
    return <ServerError />;
  }
}
