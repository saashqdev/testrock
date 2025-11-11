"use server";

import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { SurveySubmissionWithDetailsDto } from "@/db/models/helpDesk/SurveySubmissionsModel";
import { SurveyDto } from "@/modules/surveys/dtos/SurveyDtos";
import SurveyUtils from "@/modules/surveys/utils/SurveyUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import SurveySubmissionsClient from "./SurveySubmissionsClient";

type PageData = {
  item: SurveyDto;
  submissions: SurveySubmissionWithDetailsDto[];
};

async function getLoaderData(props: IServerComponentsProps): Promise<PageData> {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  let item = await db.surveys.getSurveyById({ tenantId, id: params.id! });
  if (!item) {
    redirect("/admin/help-desk/surveys");
  }
  const submissions = await db.surveySubmissions.getSurveySubmissions(item.id);
  
  return {
    item: SurveyUtils.surveyToDto(item),
    submissions,
  };
}

type ActionData = {
  success?: string;
  error?: string;
};

export async function deleteSurveySubmission(prev: any, formData: FormData): Promise<ActionData> {
  "use server";
  
  await requireAuth();
  const { t } = await getServerTranslations();
  
  const action = formData.get("action");
  const id = formData.get("id")?.toString();
  const surveyId = formData.get("surveyId")?.toString();
  
  if (action === "delete" && id) {
    try {
      await db.surveySubmissions.deleteSurveySubmission(id);
      revalidatePath(`/admin/help-desk/surveys/${surveyId}/submissions`);
      return { success: t("shared.deleted") };
    } catch (e: any) {
      return { error: e.message };
    }
  }
  
  return { error: "Invalid action" };
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await getLoaderData(props);
  return {
    title: `${data.item.title} - Submissions | ${process.env.APP_NAME}`,
  };
}

export default async function SurveySubmissionsPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getLoaderData(props);
  
  return <SurveySubmissionsClient data={data} surveyId={params.id!} />;
}
