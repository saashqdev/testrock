import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export default async function NewCategoryRedirectPage(props: IServerComponentsProps) {
  const params = await props.params;
  
  // Get the knowledge base to find its default language
  const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseBySlug(params?.slug!);
  
  if (!knowledgeBase) {
    redirect("/admin/knowledge-base/bases");
  }
  
  // Redirect to the new category page for the default language
  const defaultLanguage = knowledgeBase.defaultLanguage || knowledgeBase.languages[0] || "en";
  const languages = typeof knowledgeBase.languages === "string" ? JSON.parse(knowledgeBase.languages) : knowledgeBase.languages;
  const lang = defaultLanguage || languages[0] || "en";
  
  redirect(`/admin/knowledge-base/bases/${params?.slug}/categories/${lang}/new`);
}
