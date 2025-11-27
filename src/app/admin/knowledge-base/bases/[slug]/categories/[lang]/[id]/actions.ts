"use server";

import { revalidatePath } from "next/cache";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

type ActionData = {
  error?: string;
  success?: string;
};

export async function editCategory(
  categoryId: string,
  knowledgeBaseId: string,
  slug: string,
  lang: string,
  formData: {
    slug: string;
    title: string;
    description: string;
    icon: string;
    seoImage: string;
  }
): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.kb.update");
    
    const existing = await db.kbCategories.getKbCategoryBySlug({
      knowledgeBaseId,
      slug: formData.slug,
      language: lang,
    });

    if (existing && existing.id !== categoryId) {
      return { error: "Slug already exists" };
    }

    await db.kbCategories.updateKnowledgeBaseCategory(categoryId, {
      slug: formData.slug,
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      language: lang,
      seoImage: formData.seoImage,
    });

    revalidatePath(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
    return { success: "Category updated successfully" };
  } catch (e: any) {
    return { error: e.message || "Failed to update category" };
  }
}

export async function deleteCategory(categoryId: string): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.kb.delete");
    await db.kbCategories.deleteKnowledgeBaseCategory(categoryId);
    return { success: "Category deleted successfully" };
  } catch (e: any) {
    return { error: e.message || "Failed to delete category" };
  }
}
