import { Tenant } from "@prisma/client";
import { redirect } from "next/navigation";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import AdminApiEditKeyClient from "./client";

type LoaderData = {
  tenants: Tenant[];
  item: ApiKeyWithDetailsDto;
};

async function getLoaderData(id: string): Promise<LoaderData> {
  await verifyUserHasPermission("admin.apiKeys.view");
  const item = await db.apiKeys.getApiKeyById(id);
  if (!item) {
    redirect("/admin/api/keys");
  }
  const tenants = await db.tenants.adminGetAllTenants();
  return {
    item,
    tenants,
  };
}

export default async function AdminApiEditKeyRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLoaderData(id);
  return <AdminApiEditKeyClient tenants={data.tenants} item={data.item} />;
}
