"use server";

import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import { create } from "@/utils/api/server/TenantsApi";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { getExistingSlug } from "@/utils/services/tenantService";

export async function toggleTenantActive(id: string, action: "activate" | "deactivate", reason?: string) {
  await verifyUserHasPermission("admin.accounts.view");

  if (action === "deactivate") {
    if (!reason) {
      return { error: "Missing reason" };
    }
    await db.tenants.updateTenantDeactivated(id, {
      active: false,
      deactivatedReason: reason,
    });
    return { success: "Tenant deactivated" };
  } else if (action === "activate") {
    await db.tenants.updateTenantDeactivated(id, {
      active: true,
      deactivatedReason: null,
    });
    return { success: "Tenant activated" };
  }
  
  return { error: "Invalid action" };
}

export async function createTenant(formData: FormData) {
  await verifyUserHasPermission("admin.accounts.create");
  const { t } = await getServerTranslations();

  const name = formData.get("name")?.toString() ?? "";
  const slug = formData.get("slug")?.toString() ?? "";
  const existingSlug = await getExistingSlug(slug);
  
  if (!slug || existingSlug) {
    return { error: t("shared.slugTaken") };
  }

  // Create a mock request object for TenantsApi
  const mockRequest = new Request("http://localhost", {
    method: "POST",
  });

  const { tenant, user } = await create({ 
    request: mockRequest, 
    form: formData, 
    name, 
    slug 
  });

  const addMySelf = Boolean(formData.get("addMySelf"));
  if (addMySelf) {
    const roles = await db.roles.getAllRoles("app");
    await db.tenants.createTenantUser(
      {
        tenantId: tenant.id,
        userId: user.id,
        type: TenantUserType.OWNER,
      },
      roles
    );
  }

  return { createdTenantId: tenant.id };
}
