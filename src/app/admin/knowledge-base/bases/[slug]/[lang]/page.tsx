import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function LanguageRedirectPage(props: IServerComponentsProps) {
  const params = await props.params;
  // Redirect to the categories page for this language
  redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
}
