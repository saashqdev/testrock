import { redirect } from "next/navigation";
import { db } from "@/db";
import { PromptFlowOutputClient } from "./PromptFlowOutputClient";

type PageProps = {
  params: Promise<{ id: string; output: string }>;
};

async function getData(params: { id: string; output: string }) {
  const promptFlow = await db.promptFlows.getPromptFlow(params.id);
  if (!promptFlow) {
    redirect("/admin/prompts/builder");
  }
  const item = await db.promptFlowOutput.getPromptFlowOutput(params.output);
  if (!item) {
    redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  return {
    promptFlow,
    allEntities: await db.entities.getAllEntities(null),
    item,
  };
}

export default async function PromptFlowOutputPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getData(resolvedParams);

  return <PromptFlowOutputClient {...data} promptFlowId={resolvedParams.id} outputId={resolvedParams.output} />;
}
