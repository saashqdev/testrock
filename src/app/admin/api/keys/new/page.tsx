import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import AdminApiNewKeyClient from "./client";

export default async function AdminApiNewKeyRoute() {
  await verifyUserHasPermission("admin.apiKeys.create");
  const tenants = await db.tenants.adminGetAllTenants();

  return <AdminApiNewKeyClient tenants={tenants} />;
}
