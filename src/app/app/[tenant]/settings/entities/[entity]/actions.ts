"use server";

import { getServerTranslations } from "@/i18n/server";
import { PropertiesApi } from "@/utils/api/server/PropertiesApi";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

type ActionData = {
  error?: string;
  properties?: any[];
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
};

export async function entityPropertyAction(params: any, formData: FormData): Promise<ActionData> {
  try {
    await requireAuth();
    const { t } = await getServerTranslations();
    const tenantId = await getTenantIdOrNull({ request: null as any, params });

    const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });
    const action = formData.get("action")?.toString() ?? "";

    if (action === "set-orders") {
      const items: { id: string; order: number }[] = formData.getAll("orders[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });

      await Promise.all(
        items.map(async ({ id, order }) => {
          await db.properties.updatePropertyOrder(id, Number(order));
        })
      );
      return { updated: true };
    } else if (action === "delete") {
      const id = formData.get("id")?.toString() ?? "";
      const existingProperty = await db.properties.getProperty(id);
      if (!existingProperty) {
        return { error: t("shared.notFound") };
      }
      await db.properties.deleteProperty(id);
      return {
        properties: (await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" }))?.properties,
        deleted: true,
      };
    } else if (action === "toggle-display") {
      const id = formData.get("id")?.toString() ?? "";
      const existingProperty = await db.properties.getProperty(id);
      if (!existingProperty) {
        return { error: t("shared.notFound") };
      }
      await db.properties.updateProperty(id, {
        isDisplay: !existingProperty.isDisplay,
      });
      return {};
    } else if (action === "duplicate") {
      try {
        const propertyId = formData.get("id")?.toString() ?? "";
        await PropertiesApi.duplicate({ entity, propertyId });
        return { created: true };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    return { error: t("shared.invalidForm") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
