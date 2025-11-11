"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { FeatureFlagsFilterType } from "@/modules/featureFlags/dtos/FeatureFlagsFilterTypes";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";

export async function handleFeatureFlagAction(formData: FormData, id: string) {
  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();

  const item = await db.featureFlags.getFeatureFlag({ id, enabled: undefined });
  if (!item) {
    redirect("/admin/feature-flags/flags");
  }

  if (action === "edit") {
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();

    const filters: { type: FeatureFlagsFilterType; value: string | null; action: string | null }[] = formData.getAll("filters[]").map((f) => {
      return JSON.parse(f.toString());
    });

    if (!name || !description) {
      return { error: "Missing required fields." };
    }

    const existingFlag = await db.featureFlags.getFeatureFlag({ name, description });
    if (existingFlag && existingFlag.id !== item.id) {
      return { error: "Flag with this name and description already exists." };
    }

    try {
      await db.featureFlags.updateFeatureFlag({ id: item.id }, { name, description, filters });
    } catch (e: any) {
      return { error: e.message };
    }

    redirect("/admin/feature-flags/flags");
  } else if (action === "delete") {
    await prisma.featureFlag.delete({
      where: { id: item.id },
    });
    redirect("/admin/feature-flags/flags");
  } else {
    return { error: t("shared.invalidForm") };
  }
}
