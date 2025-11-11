import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import NewGroupComponent from "./component";

export default async function NewMemberGroupRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  await requireAuth();
  const tenantId = await getTenantIdFromUrl(params);
  const tenantUsers = await db.tenants.getTenantUsers(tenantId);

  return <NewGroupComponent tenantUsers={tenantUsers} params={params as { tenant: string }} />;
}
