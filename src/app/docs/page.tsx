import { redirect } from "next/navigation";
import { db } from "@/db";

export default async function DocsIndexPage() {
  // Get the knowledge base with slug "docs"
  const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseBySlug("docs");
  
  if (!knowledgeBase) {
    // If no "docs" knowledge base exists, redirect to admin to create one
    redirect("/admin/knowledge-base/bases");
  }
  
  // Redirect to the default language
  const defaultLanguage = knowledgeBase.defaultLanguage || knowledgeBase.languages[0] || "en";
  redirect(`/docs/${defaultLanguage}`);
}
