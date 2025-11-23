import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function (props: IServerComponentsProps) {
  const params = await props.params;
  const entity = params?.entity;

  if (!entity) {
    redirect("/admin/entities");
  }

  // Redirect to the slug-based route using the entity name
  redirect(`/admin/entities/${entity}/no-code/${entity}`);
}
