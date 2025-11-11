"use server";

import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";
import { SurveyDto } from "@/modules/surveys/dtos/SurveyDtos";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import SurveyEditClient from "./SurveyEditClient";

type LoaderData = {
  item: SurveyWithDetailsDto;
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await requireAuth();
  await verifyUserHasPermission("admin.surveys");
  const tenantId = await getTenantIdOrNull({ request, params });
  let item = await db.surveys.getSurveyById({ tenantId, id: params.id! });
  if (!item) {
    redirect("/admin/help-desk/surveys");
  }
  const data: LoaderData = {
    item,
  };
  return data;
}

type ActionData = {
  success?: string;
  error?: string;
};

export async function actionEditSurvey(prev: any, form: FormData): Promise<ActionData> {
  "use server";
  
  await requireAuth();
  const { t } = await getServerTranslations();
  
  const id = form.get("id")?.toString();
  const tenantId = form.get("tenantId")?.toString() || null;
  const action = form.get("action");
  
  if (action === "edit") {
    try {
      const item: SurveyDto = JSON.parse(form.get("item") as string);
      if (!item.title || !item.slug) {
        throw new Error("Title and slug are required");
      } else if (item.items.length === 0) {
        throw new Error("At least one item is required");
      }
      await db.surveys.updateSurvey(id!, {
        tenantId,
        title: item.title,
        slug: item.slug,
        description: item.description || "",
        isEnabled: item.isEnabled,
        isPublic: item.isPublic,
        image: item.image || null,
        items: item.items.map((item, idx) => ({
          title: item.title,
          description: item.description || "",
          type: item.type,
          order: idx + 1,
          categories: item.categories || [],
          href: item.href || "",
          color: item.color,
          options: item.options.map((option) => ({
            title: option.title,
            isOther: option.isOther || false,
            icon: option.icon || "",
            shortName: option.shortName || "",
          })),
          style: item.style === "grid" ? "grid" : "default",
        })),
        minSubmissions: item.minSubmissions,
      });
      return { success: t("shared.updated") };
    } catch (e: any) {
      return { error: e.message };
    }
  }
  return { error: "Invalid action" };
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await getLoaderData(props);
  return {
    title: `Edit ${data.item.title} | ${process.env.APP_NAME}`,
  };
}

export default async function SurveyEditPage(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  return <SurveyEditClient data={data} />;
}
