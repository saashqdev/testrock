"use server";

import { redirect } from "next/navigation";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { Colors } from "@/lib/enums/shared/Colors";
import { getServerTranslations } from "@/i18n/server";
import { PropertiesApi } from "@/utils/api/server/PropertiesApi";
import UrlUtils from "@/utils/app/UrlUtils";
import { validateProperty } from "@/lib/helpers/PropertyHelper";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";

type ActionData = {
  error?: string;
};

export async function createEntityPropertyAction(params: any, formData: FormData): Promise<ActionData | void> {
  try {
    await requireAuth();
    const { t } = await getServerTranslations();
    const tenantId = await getTenantIdOrNull({ request: null as any, params });

    const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });

    const action = formData.get("action")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const type = Number(formData.get("type")) as PropertyType;
    const subtype = formData.get("subtype")?.toString() ?? null;
    const order = Number(formData.get("order"));
    const isDefault = Boolean(formData.get("is-default"));
    let isRequired = Boolean(formData.get("is-required"));
    const isHidden = Boolean(formData.get("is-hidden"));
    const isDisplay = Boolean(formData.get("is-display"));
    const isReadOnly = Boolean(formData.get("is-read-only"));
    const canUpdate = Boolean(formData.get("can-update"));
    let showInCreate = Boolean(formData.get("show-in-create"));
    let formulaId = formData.get("formula-id")?.toString() ?? null;

    if (["id", "folio", "createdAt", "createdByUser", "sort", "page", "q", "v", "redirect", "tags"].includes(name)) {
      return { error: name + " is a reserved property name" };
    }

    const options: { order: number; value: string; name?: string; color?: Colors }[] = formData.getAll("options[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    const attributes: { name: string; value: string }[] = formData.getAll("attributes[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (type !== PropertyType.FORMULA) {
      formulaId = null;
    } else {
      isRequired = false;
      showInCreate = false;
    }
    if ([PropertyType.FORMULA].includes(type) && !formulaId) {
      return { error: "Select a formula" };
    }

    const errors = await validateProperty(name, title, entity.properties);
    if (errors.length > 0) {
      return { error: errors.join(", ") };
    }

    if (action === "create") {
      await PropertiesApi.create({
        entityId: entity.id,
        name,
        title,
        type,
        subtype,
        order,
        isDefault,
        isRequired,
        isHidden,
        isDisplay,
        isReadOnly,
        canUpdate,
        showInCreate,
        formulaId,
        options,
        attributes,
        tenantId,
      });
      redirect(UrlUtils.getModulePath(params, `entities/${params.entity}`));
    }
    return { error: t("shared.invalidForm") };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
