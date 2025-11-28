import { NextRequest, NextResponse } from "next/server";
import { getUserInfo } from "@/lib/services/session.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { db } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lang: string; id: string }> }
) {
  const resolvedParams = await params;

  try {
    // Basic authentication check
    const userInfo = await getUserInfo();
    if (!userInfo.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knowledgeBase = await KnowledgeBaseService.get({
      slug: resolvedParams.slug,
      request,
    });

    if (!knowledgeBase) {
      return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
    }

    const item = await db.kbArticles.getKbArticleById(resolvedParams.id);
    if (!item) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const allCategories = await db.kbCategories.getAllKnowledgeBaseCategoriesSimple();
    const allArticles = await db.kbArticles.getAllKnowledgeBaseArticlesSimple();
    const allKnowledgeBases = await db.knowledgeBase.getAllKnowledgeBaseNames();

    return NextResponse.json({
      knowledgeBase,
      item,
      allKnowledgeBases,
      allArticles,
      allCategories,
    });
  } catch (error: any) {
    console.error("Error fetching article settings:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lang: string; id: string }> }
) {
  const resolvedParams = await params;
  await verifyUserHasPermission("admin.kb.update");

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  const item = await db.kbArticles.getKbArticleById(resolvedParams.id);
  if (!item) {
    return Response.json({ error: "Article not found" }, { status: 400 });
  }

  if (action === "edit") {
    const knowledgeBaseId = form.get("knowledgeBaseId")?.toString() ?? "";
    const categoryId = form.get("categoryId")?.toString() ?? "";
    const sectionId = form.get("sectionId")?.toString() ?? "";
    const language = form.get("language")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";
    const isFeatured = Boolean(form.get("isFeatured"));
    const relatedArticles = form.getAll("relatedArticles[]").map((l) => l.toString());

    const knowledgeBase = await KnowledgeBaseService.getById({ id: knowledgeBaseId, request });
    if (!knowledgeBase) {
      return Response.json({ error: "Knowledge base not found" }, { status: 400 });
    }

    const existingLanguage = KnowledgeBaseUtils.supportedLanguages.find((f) => f.value === language);
    if (!existingLanguage) {
      return Response.json({ error: "Language not found: " + language }, { status: 400 });
    }

    const existing = await db.kbArticles.getKbArticleBySlug({
      knowledgeBaseId,
      slug,
      language,
    });
    if (existing && existing.id !== item.id) {
      return Response.json({ error: "Slug already exists" }, { status: 400 });
    }

    let featuredOrder = item.featuredOrder;
    if (isFeatured) {
      if (!item.featuredOrder) {
        const featuredArticles = await db.kbArticles.getFeaturedKnowledgeBaseArticles({
          knowledgeBaseId,
          language,
        });
        let maxOrder = 0;
        if (featuredArticles.length > 0) {
          maxOrder = Math.max(...featuredArticles.map((p) => p.featuredOrder ?? 0));
        }
        featuredOrder = maxOrder + 1;
      }
    } else {
      featuredOrder = null;
    }

    await db.kbArticles.updateKnowledgeBaseArticle(item.id, {
      categoryId: categoryId?.length ? categoryId : null,
      sectionId: sectionId?.length ? sectionId : null,
      slug,
      title,
      description,
      order: item.order,
      language,
      featuredOrder,
      seoImage,
    });

    return Response.json({
      success: true,
      redirectUrl: `/admin/knowledge-base/bases/${resolvedParams.slug}/articles/${language}/${item.id}`,
    });
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.kb.delete");
    const kb = await KnowledgeBaseService.get({ slug: resolvedParams.slug, request });
    await db.kbArticles.deleteKnowledgeBaseArticle(item.id);

    return Response.json({
      success: true,
      redirectUrl: `/admin/knowledge-base/bases/${kb.slug}/articles/${resolvedParams.lang}`,
    });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
