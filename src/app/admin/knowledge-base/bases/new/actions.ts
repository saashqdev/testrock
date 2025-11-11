"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { KbNavLinkDto } from "@/modules/knowledgeBase/dtos/KbNavLinkDto";

type ActionData = {
  error?: string;
  success?: string;
};

export async function createKnowledgeBase(formData: FormData): Promise<ActionData | undefined> {
  const action = formData.get("action")?.toString();
  if (action === "new") {
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
    const existing = await db.knowledgeBase.getKnowledgeBaseBySlug(slug);
    if (existing) {
      return { error: "Slug already exists" };
    }

    if (!basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }
    if (slug.startsWith("/")) {
      slug = slug.substring(1);
    }
    try {
      await db.knowledgeBase.createKnowledgeBase({
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
      redirect("/admin/knowledge-base/bases");
    } catch (e: any) {
      return { error: e.message };
    }
  } else {
    return { error: "Invalid form" };
  }
}
