import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function NewEntityWebhookRoute(props: IServerComponentsProps) {
  const params = await props.params;
  const entity = params?.entity ?? "";
  // Redirect to main webhooks page - modal is now handled in the WebhooksTable component
  redirect(`/admin/entities/${entity}/webhooks`);
}
