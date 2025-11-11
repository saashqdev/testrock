import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsIdRunStreamApi } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.stream.api.server";
import WorkflowsIdRunStreamView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.stream.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const response = await WorkflowsIdRunStreamApi.loader(props);
    const data = await response.json() as WorkflowsIdRunStreamApi.LoaderData;
    const metatags = data?.metatags || [];
    
    // Extract metadata from MetaTagsDto format
    const title = metatags.find(tag => 'title' in tag)?.title;
    const descriptionTag = metatags.find(tag => 'name' in tag && tag.name === 'description');
    const keywordsTag = metatags.find(tag => 'name' in tag && tag.name === 'keywords');
    
    return {
      title: title || 'Workflow Stream',
      description: descriptionTag && 'content' in descriptionTag ? descriptionTag.content : undefined,
      keywords: keywordsTag && 'content' in keywordsTag ? keywordsTag.content : undefined,
    };
  } catch (error) {
    return {
      title: 'Workflow Stream',
    };
  }
}

export const loader = (props: IServerComponentsProps) => WorkflowsIdRunStreamApi.loader(props);
export const action = (props: IServerComponentsProps) => WorkflowsIdRunStreamApi.action(props);

export default async function Page(props: IServerComponentsProps) {
  try {
    const response = await WorkflowsIdRunStreamApi.loader(props);
    const data = await response.json() as WorkflowsIdRunStreamApi.LoaderData;
    
    const workflowAction = async (prev: any, formData: FormData) => {
      "use server";
      try {
        const actionResponse = await WorkflowsIdRunStreamApi.action({ 
          ...props, 
          request: new Request(props.request?.url || "", { 
            method: "POST", 
            body: formData 
          })
        });
        
        if (actionResponse.ok) {
          return await actionResponse.json();
        } else {
          const errorData = await actionResponse.json();
          return { error: errorData.error || "An error occurred" };
        }
      } catch (error: any) {
        return { error: error.message || "An error occurred" };
      }
    };

    return <WorkflowsIdRunStreamView data={data} workflowAction={workflowAction} />;
  } catch (error) {
    return <ServerError />;
  }
}

export function ErrorBoundary() {
  return <ServerError />;
}
