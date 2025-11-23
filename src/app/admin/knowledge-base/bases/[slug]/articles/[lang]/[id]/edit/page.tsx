import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import ArticleEditClient from "../../../../ArticleEditClient";
import { db } from "@/db";

type PageProps = {
  params: Promise<{ slug: string; lang: string; id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const { t } = await getServerTranslations();
    const knowledgeBase = await KnowledgeBaseService.get({
      slug: resolvedParams.slug,
      request: new Request("http://localhost"),
    });

    if (!knowledgeBase) {
      return { title: "Not Found" };
    }

    const item = await db.kbArticles.getKbArticleById(resolvedParams.id);
    if (!item) {
      return { title: "Not Found" };
    }

    return {
      title: `${t("shared.edit")}: ${item.title} | ${knowledgeBase.title} | ${t("knowledgeBase.title")} | ${process.env.APP_NAME}`,
    };
  } catch (error) {
    return { title: "Error" };
  }
}

async function updateArticle(formData: FormData, slug: string, lang: string, id: string) {
  "use server";

  await verifyUserHasPermission(null as any, "admin.kb.update");

  const action = formData.get("action")?.toString() ?? "";

  const item = await db.kbArticles.getKbArticleById(id);
  if (!item) {
    return { error: "Article not found" };
  }

  if (action === "edit") {
    const content = formData.get("content")?.toString() ?? "";
    const contentType = formData.get("contentType")?.toString() ?? "";

    await db.kbArticles.updateKnowledgeBaseArticle(item.id, {
      contentDraft: content,
      contentType,
    });

    redirect(`/admin/knowledge-base/bases/${slug}/articles/${lang}/${id}`);
  }

  return { error: "Invalid action" };
}

export default async function ArticleEditPage({ params }: PageProps) {
  const resolvedParams = await params;

  await verifyUserHasPermission(null as any, "admin.kb.view");

  const knowledgeBase = await KnowledgeBaseService.get({
    slug: resolvedParams.slug,
    request: new Request("http://localhost"),
  });

  if (!knowledgeBase) {
    redirect("/admin/knowledge-base/bases");
  }

  const item = await db.kbArticles.getKbArticleById(resolvedParams.id);
  if (!item) {
    redirect(`/admin/knowledge-base/bases/${resolvedParams.slug}/articles`);
  }

  const updateArticleWithParams = updateArticle.bind(null, {} as FormData, resolvedParams.slug, resolvedParams.lang, resolvedParams.id);

  return <ArticleEditClient knowledgeBase={knowledgeBase} item={item} params={resolvedParams} updateArticle={updateArticleWithParams} />;
}
