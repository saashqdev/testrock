"use server";

import { KnowledgeBaseWithDetailsDto } from "@/db/models/knowledgeBase/KnowledgeBaseModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

type ActionData = {
  error?: string;
  success?: string;
};

export async function createKbCategory(slug: string, lang: string, formData: FormData): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.kb.create");

    const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseBySlug(slug);
    if (!knowledgeBase) {
      return { error: "Knowledge base not found" };
    }

    const categorySlug = formData.get("slug")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const icon = formData.get("icon")?.toString() ?? "";
    const seoImage = formData.get("seoImage")?.toString() ?? "";

    if (!categorySlug || !title) {
      return { error: "Slug and title are required" };
    }

    const allCategories = await db.kbCategories.getAllKnowledgeBaseCategories({
      knowledgeBaseSlug: slug,
      language: lang,
    });
    let maxOrder = 0;
    if (allCategories.length > 0) {
      maxOrder = Math.max(...allCategories.map((i) => i.order));
    }

    const existing = await db.kbCategories.getKbCategoryBySlug({
      knowledgeBaseId: knowledgeBase.id,
      slug: categorySlug,
      language: lang,
    });
    if (existing) {
      return { error: "Slug already exists" };
    }

    try {
      await db.kbCategories.createKnowledgeBaseCategory({
        knowledgeBaseId: knowledgeBase.id,
        slug: categorySlug,
        title,
        description,
        icon,
        language: lang,
        seoImage,
        order: maxOrder + 1,
      });
      return { success: "Category created successfully" };
    } catch (e: any) {
      return { error: e.message };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getKnowledgeBase(slug: string): Promise<KnowledgeBaseWithDetailsDto | null> {
  try {
    await verifyUserHasPermission("admin.kb.view");
    const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseBySlug(slug);
    return knowledgeBase;
  } catch (e) {
    return null;
  }
}
