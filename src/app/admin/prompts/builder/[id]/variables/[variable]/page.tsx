import { redirect } from "next/navigation";
import { db } from "@/db";
import VariableClient from "./VariableClient";

type VariablePageProps = {
  params: Promise<{ id: string; variable: string }>;
};

export default async function VariablePage(props: VariablePageProps) {
  const params = await props.params;
  const item = await db.promptFlowInputVariables.getPromptFlowVariable(params.variable);
  
  if (!item) {
    redirect(`/admin/prompts/builder/${params.id}/variables`);
  }

  return <VariableClient item={item} id={params.id} />;
}
