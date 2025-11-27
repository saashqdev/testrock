"use server";

import { KbNavLinkDto } from "@/modules/knowledgeBase/dtos/KbNavLinkDto";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { KnowledgeBaseWithDetailsDto } from "@/db/models/knowledgeBase/KnowledgeBaseModel";

type ActionData = {
  error?: string;
  success?: string;
};

export async function getKnowledgeBase(id: string): Promise<KnowledgeBaseWithDetailsDto | null> {
  try {
    await verifyUserHasPermission("admin.kb.view");
    const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseById(id);
    return knowledgeBase;
  } catch (e) {
    return null;
  }
}

export async function editKnowledgeBase(id: string, formData: FormData): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.kb.update");

    const item = await db.knowledgeBase.getKnowledgeBaseById(id);

    if (!item) {
      return { error: "Knowledge base not found" };
    }

    let basePath = formData.get("basePath")?.toString() ?? "";
    let slug = formData.get("slug")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const defaultLanguage = formData.get("defaultLanguage")?.toString() ?? "";
    const layout = formData.get("layout")?.toString() ?? "";
    const color = Number(formData.get("color")?.toString() ?? "");
    const enabled = Boolean(formData.get("enabled"));
    const languages = formData.getAll("languages[]").map((l) => l.toString());
    const links: KbNavLinkDto[] = formData.getAll("links[]").map((l) => JSON.parse(l.toString()));
    const logo = formData.get("logo")?.toString() ?? "";
    const seoImage = formData.get("seoImage")?.toString() ?? "";

    if (languages.length === 0) {
      return { error: "At least one language is required" };
    }

    if (!basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }
    if (slug.startsWith("/")) {
      slug = slug.substring(1);
    }

    const existing = await db.knowledgeBase.getKnowledgeBaseBySlug(slug);
    if (existing && existing.id !== item.id) {
      return { error: "Slug already exists" };
    }

    try {
      await db.knowledgeBase.updateKnowledgeBase(item.id, {
        basePath,
        slug,
        title,
        description,
        defaultLanguage,
        layout,
        color,
        enabled,
        languages: JSON.stringify(languages),
        links: JSON.stringify(links),
        logo,
        seoImage,
      });

      revalidatePath("/admin/knowledge-base/bases");
      return { success: "Knowledge base updated successfully" };
    } catch (e: any) {
      return { error: e.message };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteKnowledgeBase(id: string): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.kb.delete");

    const item = await db.knowledgeBase.getKnowledgeBaseById(id);

    if (!item) {
      return { error: "Knowledge base not found" };
    }

    try {
      await db.knowledgeBase.deleteKnowledgeBase(id);
      revalidatePath("/admin/knowledge-base/bases");
      return { success: "Knowledge base deleted successfully" };
    } catch (e: any) {
      return { error: e.message };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}
