import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import KbArticleSettingsClient from "../KbArticleSettingsClient";
import { db } from "@/db";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const request = props.request!;
  const { t } = await getServerTranslations();
  
  try {
    const knowledgeBase = await KnowledgeBaseService.get({
      slug: params.slug!,
      request,
    });
    const item = await db.kbArticles.getKbArticleById(params.id!);
    
    if (!knowledgeBase || !item) {
      return { title: t("knowledgeBase.title") };
    }
    
    return {
      title: `${t("shared.settings")}: ${item.title} | ${knowledgeBase.title} | ${t("knowledgeBase.title")} | ${process.env.APP_NAME}`,
    };
  } catch (error) {
    return { title: t("knowledgeBase.title") };
  }
}

export default async function KbArticleSettingsPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await verifyUserHasPermission("admin.kb.view");
  
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  
  if (!knowledgeBase) {
    redirect("/admin/knowledge-base/bases");
  }
  
  const item = await db.kbArticles.getKbArticleById(params.id!);
  if (!item) {
    redirect(`/admin/knowledge-base/bases/${params.slug!}/articles`);
  }
  
  const allCategories = await db.kbCategories.getAllKnowledgeBaseCategoriesSimple();
  const allArticles = await db.kbArticles.getAllKnowledgeBaseArticlesSimple();
  const allKnowledgeBases = await db.knowledgeBase.getAllKnowledgeBaseNames();

  return (
    <KbArticleSettingsClient
      knowledgeBase={knowledgeBase}
      item={item}
      allKnowledgeBases={allKnowledgeBases}
      allArticles={allArticles}
      allCategories={allCategories}
      slug={params.slug!}
      lang={params.lang!}
    />
  );
}
