"use server";

import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { SurveyDto } from "@/modules/surveys/dtos/SurveyDtos";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import NewSurveyClient from "./NewSurveyClient";
import { db } from "@/db";

type ActionData = {
  success?: string;
  error?: string;
};

export async function createSurveyAction(prev: any, formData: FormData): Promise<ActionData> {
  "use server";

  await requireAuth();
  await verifyUserHasPermission("admin.surveys");
  const { t } = await getServerTranslations();

  const action = formData.get("action");

  if (action === "create") {
    try {
      const item: SurveyDto = JSON.parse(formData.get("item") as string);
      const tenantId = formData.get("tenantId")?.toString() || null;

      if (!item.title || !item.slug) {
        throw new Error("Title and slug are required");
      } else if (item.items.length === 0) {
        throw new Error("At least one item is required");
      }

      await db.surveys.createSurvey({
        tenantId,
        title: item.title,
        slug: item.slug,
        description: item.description || "",
        isEnabled: item.isEnabled,
        isPublic: item.isPublic,
        minSubmissions: item.minSubmissions,
        image: item.image || null,
        items: item.items.map((item, idx) => ({
          title: item.title,
          description: item.description || "",
          type: item.type,
          order: idx + 1,
          categories: item.categories || [],
          href: item.href || "",
          color: item.color,
          style: item.style || "default",
          options: item.options.map((option) => ({
            title: option.title,
            isOther: option.isOther || false,
            icon: option.icon || "",
            shortName: option.shortName || "",
          })),
        })),
      });

      return { success: t("shared.created") };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  return { error: "Invalid action" };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `New Survey | ${process.env.APP_NAME}`,
  };
}

export default async function NewSurveyPage(props: IServerComponentsProps) {
  await requireAuth();
  await verifyUserHasPermission("admin.surveys");

  return <NewSurveyClient action={createSurveyAction} />;
}
