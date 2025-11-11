"use server";

import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SurveySubmissionWithDetailsDto } from "@/db/models/helpDesk/SurveySubmissionsModel";
import { SurveyDto } from "@/modules/surveys/dtos/SurveyDtos";
import SurveyUtils from "@/modules/surveys/utils/SurveyUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import SurveyDetailsClient from "./SurveyDetailsClient";

type LoaderData = {
  item: SurveyDto;
  submissions: SurveySubmissionWithDetailsDto[];
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  let item = await db.surveys.getSurveyById({ tenantId, id: params.id! });
  
  return {
    title: item ? `${item.title} | ${process.env.APP_NAME}` : `Survey | ${process.env.APP_NAME}`,
  };
}

export default async function SurveyDetailsPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  let item = await db.surveys.getSurveyById({ tenantId, id: params.id! });
  if (!item) {
    redirect("/admin/help-desk/surveys");
  }
  const submissions = await db.surveySubmissions.getSurveySubmissions(item.id);
  const data: LoaderData = {
    item: SurveyUtils.surveyToDto(item),
    submissions,
  };

  return <SurveyDetailsClient data={data} surveyId={params.id!} />;
}
