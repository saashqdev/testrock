import { redirect } from "next/navigation";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { PromptFlowInputVariableWithDetailsDto } from "@/db/models/promptFlows/PromptFlowInputVariablesModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import VariablesClient from "./VariablesClient";
import { ReactNode } from "react";

type PageData = {
  item: PromptFlowWithDetailsDto;
  items: PromptFlowInputVariableWithDetailsDto[];
};

type VariablesPageServerProps = {
  params: Promise<{ id: string }>;
  children?: ReactNode;
};

export default async function VariablesPage(props: VariablesPageServerProps) {
  const params = await props.params;
  
  const item = await db.promptFlows.getPromptFlow(params.id);
  await verifyUserHasPermission("admin.prompts.update");
  
  if (!item) {
    redirect("/admin/prompts/builder");
  }
  
  const items = await db.promptFlowInputVariables.getPromptFlowVariables(item.id);
  
  return <VariablesClient item={item} items={items}>{props.children}</VariablesClient>;
}
