import { Metadata } from "next";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import SurveysListClient from "./SurveysListClient";

type LoaderData = {
  items: SurveyWithDetailsDto[];
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const params = (await props.params) || {};
  
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.surveys) {
    throw new Error("Surveys are not enabled");
  }
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await db.surveys.getAllSurveys({ tenantId });
  const data: LoaderData = {
    items,
  };
  return data;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Surveys | ${process.env.APP_NAME}`,
  };
}

export default async function SurveysPage(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  
  return <SurveysListClient items={data.items} />;
}
