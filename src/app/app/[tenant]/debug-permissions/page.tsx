import { db } from "@/db";
import { getUserInfo } from "@/lib/services/session.server";
import { requireTenantSlug } from "@/lib/services/url.server";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function DebugPermissionsPage(props: IServerComponentsProps) {
  const tenantSlug = await requireTenantSlug();
  const tenant = await getTenantIdFromUrl(tenantSlug);
  const userInfo = await getUserInfo();

  const user = await db.users.getUser(userInfo.userId);
  const allPermissions = await db.userRoles.getPermissionsByUser(userInfo.userId, tenant.id);

  const hasApiKeysView = allPermissions.some((p) => p === "app.settings.apiKeys.view");
  const hasAuditTrailsView = allPermissions.some((p) => p === "app.settings.auditTrails.view");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Permissions</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">User Info</h2>
          <p>Email: {user?.email}</p>
          <p>User ID: {userInfo.userId}</p>
          <p>Admin: {user?.admin ? "Yes" : "No"}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Tenant Info</h2>
          <p>Name: {tenant?.name}</p>
          <p>Slug: {tenant?.slug}</p>
          <p>Tenant ID: {tenant?.id}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Key Permissions</h2>
          <p>app.settings.apiKeys.view: {hasApiKeysView ? "✅ YES" : "❌ NO"}</p>
          <p>app.settings.auditTrails.view: {hasAuditTrailsView ? "✅ YES" : "❌ NO"}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">All Permissions ({allPermissions.length})</h2>
          <div className="max-h-96 overflow-auto">
            <pre className="text-xs">{JSON.stringify(allPermissions, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
