import { redirect } from "next/navigation";
import { PromptFlowOutputMappingWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputMappingsModel";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import OutputMappingClient from "../OutputMappingClient";
import { db } from "@/db";

type PageData = {
  promptFlow: PromptFlowWithDetailsDto;
  promptFlowOutput: PromptFlowOutputWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  item: PromptFlowOutputMappingWithDetailsDto;
};

export default async function OutputMappingPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};

  const promptFlow = await db.promptFlows.getPromptFlow(params.id!);
  if (!promptFlow) {
    redirect("/admin/prompts/builder");
  }

  const promptFlowOutput = await db.promptFlowOutput.getPromptFlowOutput(params.output!);
  if (!promptFlowOutput) {
    redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }

  const item = await db.promptFlowOutputMapping.getPromptFlowOutputMapping(params.mapping!);
  if (!item) {
    redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }

  const data: PageData = {
    promptFlow,
    promptFlowOutput,
    allEntities: await db.entities.getAllEntities(null),
    item,
  };

  return <OutputMappingClient data={data} params={params} />;
}
