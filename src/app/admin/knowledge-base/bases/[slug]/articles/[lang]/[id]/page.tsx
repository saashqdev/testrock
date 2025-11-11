import { redirect } from "next/navigation";
import { Metadata } from "next";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import ArticleClientComponent from "./ArticleClientComponent";

type PageProps = {
  params: Promise<{ slug: string; lang: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const { t } = await getServerTranslations();
  
  try {
    const knowledgeBase = await KnowledgeBaseService.get({
      slug,
      request: new Request("http://localhost"),
    });
    
    if (!knowledgeBase) {
      return { title: "Article Not Found" };
    }
    
    const item = await KnowledgeBaseService.getArticleById({
      kb: knowledgeBase,
      id,
      request: new Request("http://localhost"),
    });
    
    if (!item) {
      return { title: "Article Not Found" };
    }
    
    return {
      title: `${item.title} | ${knowledgeBase.title} | ${t("knowledgeBase.title")} | ${process.env.APP_NAME}`,
    };
  } catch (error) {
    return { title: "Error Loading Article" };
  }
}

async function getPageData(slug: string, lang: string, id: string) {
  const request = new Request("http://localhost");
  await verifyUserHasPermission("admin.kb.view");
  const { t } = await getServerTranslations();
  
  const knowledgeBase = await KnowledgeBaseService.get({
    slug,
    request,
  });
  
  if (!knowledgeBase) {
    redirect("/admin/knowledge-base/bases");
  }
  
  const item = await KnowledgeBaseService.getArticleById({
    kb: knowledgeBase,
    id,
    request,
  });
  
  if (!item) {
    redirect(`/admin/knowledge-base/bases/${slug}/articles`);
  }
  
  return {
    knowledgeBase,
    item,
  };
}

async function togglePublishAction(id: string, formData: FormData) {
  "use server";
  
  const request = new Request("http://localhost");
  await verifyUserHasPermission("admin.kb.update");
  
  const item = await db.kbArticles.getKbArticleById(id);
  if (!item) {
    return { error: "Article not found" };
  }

  if (!item.categoryId) {
    return { error: "Article must have a category. Go to settings to set one." };
  }
  
  let publishedAt = item.publishedAt;
  let contentPublished = item.contentPublished;
  if (item.publishedAt) {
    publishedAt = null;
  } else {
    publishedAt = new Date();
    contentPublished = item.contentDraft;
  }

  const text = await KnowledgeBaseService.contentAsText(contentPublished);
  await db.kbArticles.updateKnowledgeBaseArticle(item.id, {
    publishedAt,
    contentPublished,
    contentPublishedAsText: text,
  });

  return { success: true };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug, lang, id } = await params;
  const data = await getPageData(slug, lang, id);
  
  const togglePublishWithId = togglePublishAction.bind(null, id);
  
  return (
    <ArticleClientComponent 
      data={data}
      slug={slug}
      lang={lang}
      id={id}
      togglePublishAction={togglePublishWithId}
    />
  );
}
