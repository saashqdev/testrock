import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/variables/[id]/api/server";
import WorkflowsVariablesIdView from "@/modules/workflowEngine/routes/workflow-engine/variables/[id]/view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await loader({ params });
  return { title: data?.metatags?.[0]?.title ?? "Edit Workflows Variable" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const data = await loader({ params });
  return <WorkflowsVariablesIdView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
