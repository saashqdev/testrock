import { redirect } from "next/navigation";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import PageClient from "./PageClient";

type LoaderData = {
  item: PromptFlowWithDetailsDto;
  items: PromptFlowOutputWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
};

export default async function PromptsBuilderOutputsPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.prompts.update");

  const item = await db.promptFlows.getPromptFlow(params.id!);
  if (!item) {
    redirect("/admin/prompts/builder");
  }

  const items = await db.promptFlowOutput.getPromptFlowOutputs(item.id);
  const allEntities = await db.entities.getAllEntities(null);

  const data: LoaderData = {
    item,
    items,
    allEntities,
  };

  return <PageClient initialData={data} />;
}
