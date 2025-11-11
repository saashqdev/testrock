import { redirect } from "next/navigation";
import { Metadata } from "next";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { getServerTranslations } from "@/i18n/server";
import PromptResults from "@/modules/promptBuilder/components/PromptResults";
import { db } from "@/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();
  const item = await db.promptFlows.getPromptFlowWithExecutions(resolvedParams.id ?? "");
  
  if (!item) {
    return { title: "Not Found" };
  }

  return {
    title: `${item.title} | Results | ${t("prompts.builder.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function PromptResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await db.promptFlows.getPromptFlowWithExecutions(resolvedParams.id ?? "");
  
  if (!item) {
    redirect("/admin/prompts/builder");
  }

  return (
    <EditPageLayout
      title={`All Results - ${item.title}`}
      menu={[
        {
          title: "Prompts",
          routePath: "/admin/prompts/builder",
        },
        {
          title: "Executions",
          routePath: `/admin/prompts/executions/${item.id}`,
        },
        {
          title: "All Results",
          routePath: `/admin/prompts/results/${item.id}`,
        },
      ]}
    >
      <PromptResults item={item} />
    </EditPageLayout>
  );
}
