"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerTranslations } from "@/i18n/server";
import { createFromForm, updateFromForm } from "@/utils/api/server/EntityViewsApi";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";

type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function updateEntityView(formData: FormData): Promise<ActionResult> {
  try {
    // Create a mock Request object for permission verification
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const url = `${protocol}://${host}/admin/entities/views`;
    const request = new Request(url);
    
    await verifyUserHasPermission("admin.entities.update");

    const id = formData.get("id")?.toString() ?? "";
    const item = await db.entityViews.getEntityViewWithTenantAndUser(id);
    if (!item) {
      return { error: "Entity view not found" };
    }

    const entityId = formData.get("entityId")?.toString() ?? "";
    const entity = await db.entities.getEntityById({ tenantId: null, id: entityId });
    if (!entity) {
      return { error: "Entity not found" };
    }

    await updateFromForm({ entity, item, form: formData });
  } catch (e: any) {
    return { error: e.message };
  }
  
  redirect(`/admin/entities/views`);
}

export async function deleteEntityView(formData: FormData): Promise<ActionResult> {
  try {
    // Create a mock Request object for permission verification
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const url = `${protocol}://${host}/admin/entities/views`;
    const request = new Request(url);
    
    await verifyUserHasPermission("admin.entities.update");

    const id = formData.get("id")?.toString() ?? "";
    const item = await db.entityViews.getEntityViewWithTenantAndUser(id);
    if (!item) {
      return { error: "Entity view not found" };
    }

    await db.entityViews.deleteEntityView(item.id);
  } catch (e: any) {
    return { error: e.message };
  }
  
  redirect(`/admin/entities/views`);
}

export async function createEntityView(formData: FormData): Promise<ActionResult> {
  try {
    // Create a mock Request object for permission verification
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const url = `${protocol}://${host}/admin/entities/views`;
    const request = new Request(url);
    
    await verifyUserHasPermission("admin.entities.update");

    const userInfo = await getUserInfo();
    const entityId = formData.get("entityId")?.toString() ?? "";
    const entity = await db.entities.getEntityById({ tenantId: null, id: entityId });
    if (!entity) {
      return { error: "Entity not found" };
    }

    await createFromForm({ entity, form: formData, createdByUserId: userInfo.userId });
  } catch (e: any) {
    return { error: e.message };
  }
  
  redirect(`/admin/entities/views`);
}
