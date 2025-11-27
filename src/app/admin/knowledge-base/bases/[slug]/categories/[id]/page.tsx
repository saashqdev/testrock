import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export default async function CategoryRedirectPage(props: IServerComponentsProps) {
  const params = await props.params;
  
  // Get the category to find its language
  const category = await db.kbCategories.getKbCategoryById(params.id!);
  
  if (!category) {
    redirect(`/admin/knowledge-base/bases/${params.slug}/categories`);
  }
  
  // Redirect to the edit page with the language parameter
  redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${category.language}/${params.id}`);
}
