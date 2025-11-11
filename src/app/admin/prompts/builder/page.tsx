import { PromptFlowGroup } from "@prisma/client";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { PromptFlowWithExecutionsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { db } from "@/db";
import PromptBuilderClient from "../PromptBuilderClient";

type LoaderData = {
  title: string;
  items: PromptFlowWithExecutionsDto[];
  allEntities: EntityWithDetailsDto[];
  groups: PromptFlowGroup[];
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("prompts.builder.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function PromptBuilderPage() {
  const data: LoaderData = {
    title: `Prompt Builder | ${process.env.APP_NAME}`,
    items: await db.promptFlows.getPromptFlowsWithExecutions(),
    allEntities: await db.entities.getAllEntities(null),
    groups: await db.promptFlowGroups.getAllPromptFlowGroups(),
  };

  return <PromptBuilderClient data={data} />;
}
