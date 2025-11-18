"use server";

import { revalidatePath } from "next/cache";
import { getServerTranslations } from "@/i18n/server";
import { duplicate } from "@/utils/api/server/PropertiesApi";
import { db } from "@/db";

export async function setPropertyOrders(entitySlug: string, orders: { id: string; order: number }[]) {
  await Promise.all(
    orders.map(async ({ id, order }) => {
      await db.properties.updatePropertyOrder(id, Number(order));
    })
  );
  
  revalidatePath(`/admin/entities/${entitySlug}/properties`);
  return { success: true };
}

export async function deleteProperty(entitySlug: string, propertyId: string) {
  const { t } = await getServerTranslations();
  
  const existingProperty = await db.properties.getProperty(propertyId);
  if (!existingProperty) {
    throw new Error(t("shared.notFound"));
  }
  
  await db.properties.deleteProperty(propertyId);
  revalidatePath(`/admin/entities/${entitySlug}/properties`);
  return { success: true };
}

export async function togglePropertyDisplay(entitySlug: string, propertyId: string) {
  const existingProperty = await db.properties.getProperty(propertyId);
  if (!existingProperty) {
    throw new Error("Property not found");
  }
  
  await db.properties.updateProperty(propertyId, {
    isDisplay: !existingProperty.isDisplay,
  });
  
  revalidatePath(`/admin/entities/${entitySlug}/properties`);
  return { success: true };
}

export async function duplicateProperty(entitySlug: string, propertyId: string) {
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: entitySlug });
  if (!entity) {
    throw new Error("Entity not found");
  }
  
  await duplicate({ entity, propertyId });
  revalidatePath(`/admin/entities/${entitySlug}/properties`);
  return { success: true };
}
