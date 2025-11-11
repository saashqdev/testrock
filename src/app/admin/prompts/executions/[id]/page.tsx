import { redirect } from "next/navigation";
import { Metadata } from "next";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { getServerTranslations } from "@/i18n/server";
import { PromptFlowWithExecutionsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { db } from "@/db";
import PromptExecutionsClient from "./PromptExecutionsClient";

type LoaderData = {
  title: string;
  item: PromptFlowWithExecutionsDto;
};

async function getData(params: { id?: string }): Promise<LoaderData> {
  const { t } = await getServerTranslations();
  const item = await db.promptFlows.getPromptFlowWithExecutions(params.id ?? "");
  if (!item) {
    redirect("/admin/prompts/builder");
  }

  return {
    title: `${item.title} | Executions | ${t("prompts.builder.title")} | ${process.env.APP_NAME}`,
    item,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getData(resolvedParams);
  return {
    title: data.title,
  };
}

export default async function ExecutionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getData(resolvedParams);
  
  return (
    <EditPageLayout
      title={`Executions - ${data.item.title}`}
      withHome={false}
      menu={[
        {
          title: "Prompts",
          routePath: "/admin/prompts/builder",
        },
        {
          title: "Execution",
          routePath: `/admin/prompts/executions/${data.item.id}`,
        },
      ]}
    >
      <PromptExecutionsClient item={data.item} />
    </EditPageLayout>
  );
}
