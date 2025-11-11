"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { clearAllCache } from "@/lib/services/cache.server";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getUserInfo } from "@/lib/services/session.server";
import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";

type ActionData = {
  error?: string;
  success?: string;
  redirect?: string;
};

export async function handleDangerAction(formData: FormData): Promise<ActionData> {
  try {
    await verifyUserHasPermission(null as any, "admin.entities.delete");
    
    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();
    const user = await db.users.getUser(userInfo.userId);
    
    if (!user?.admin) {
      const userRoles = await db.userRoles.getUserRoles(userInfo.userId);
      if (!userRoles.find((f) => f.role.name === DefaultAdminRoles.SuperAdmin)) {
        return { error: t("shared.invalidForm") };
      }
    }
    
    const entitySlug = formData.get("entitySlug") as string;
    const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: entitySlug });
    const action = formData.get("action");
    
    if (action === "delete-all-rows") {
      await db.rows.deleteRows(entity.id);
      return { success: t("shared.deleted") };
    } else if (action === "delete") {
      const count = await db.rows.countRows({ entityId: entity.id });
      if (count > 0) {
        return { error: `Entity ${entity.name} cannot be deleted because it has ${count} rows` };
      }
      
      await db.permissions.deleteEntityPermissions(entity);
      await db.entities.deleteEntity(entity.id, null);
      await clearAllCache();
      
      return { redirect: "/admin/entities" };
    }
    
    return { error: t("shared.invalidForm") };
  } catch (error: any) {
    return { error: error.message || "An error occurred" };
  }
}
