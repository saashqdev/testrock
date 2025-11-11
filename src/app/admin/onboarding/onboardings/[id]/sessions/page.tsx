import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "@/modules/onboarding/services/OnboardingService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import OnboardingSessionsClient from "./sessions-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  item: OnboardingWithDetailsDto;
  items: OnboardingSessionWithDetailsDto[];
  metadata: OnboardingFilterMetadataDto;
};

async function getData(props: IServerComponentsProps): Promise<PageData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.onboarding.update");
  
  const item = await db.onboarding.getOnboarding(params.id!);
  if (!item) {
    redirect("/admin/onboarding/onboardings");
  }
  
  const items = await db.onboardingSessions.getOnboardingSessions({
    onboardingId: item.id,
  });
  
  return {
    item,
    items,
    metadata: await OnboardingService.getMetadata(),
  };
}

async function deleteSession(id: string) {
  "use server";
  
  const { t } = await getServerTranslations();
  
  if (!id) {
    return { error: "Session ID is required" };
  }
  
  const session = await db.onboardingSessions.getOnboardingSession(id);
  if (!session) {
    return { error: "Session not found" };
  }
  
  await db.onboardingSessionStep.deleteOnboardingSessionSteps(session.sessionSteps.map((s) => s.id));
  await db.onboardingSessions.deleteOnboardingSession(id);
  
  return { success: "Onboarding session deleted" };
}

export default async function OnboardingSessionsPage(props: IServerComponentsProps) {
  const data = await getData(props);
  
  return <OnboardingSessionsClient data={data} deleteSession={deleteSession} />;
}
