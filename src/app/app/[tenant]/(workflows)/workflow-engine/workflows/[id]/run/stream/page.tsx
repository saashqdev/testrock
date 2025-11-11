"use server";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkflowsIdRunStreamApi } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.stream.api.server";
import WorkflowsIdRunStreamView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.stream.view";

type Props = {
  params: Promise<{ tenant: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return WorkflowsIdRunStreamApi.generateMetadata({ params: resolvedParams });
}

export default async function WorkflowsIdRunStreamPage({ params }: Props) {
  const resolvedParams = await params;
  
  const workflowAction = async (prev: any, formData: FormData) => {
    "use server";
    const request = new Request("", { method: "POST", body: formData });
    const response = await WorkflowsIdRunStreamApi.action({ 
      request, 
      params: Promise.resolve(resolvedParams)
    });
    return await response.json();
  };
  
  try {
    const request = new Request(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/workflow-engine/workflows/${resolvedParams.id}/run/stream`);
    const response = await WorkflowsIdRunStreamApi.loader({ 
      request, 
      params: Promise.resolve(resolvedParams)
    });
    
    const data = await response.json();
    
    return <WorkflowsIdRunStreamView data={data} workflowAction={workflowAction} />;
  } catch (error) {
    notFound();
  }
}
