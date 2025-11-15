import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "@/modules/onboarding/services/OnboardingService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import OnboardingDetailsClient from "./OnboardingDetailsClient";
import { db } from "@/db";

type PageData = {
  item: OnboardingWithDetailsDto;
  metadata: OnboardingFilterMetadataDto;
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
  };
}

async function getData(props: IServerComponentsProps): Promise<PageData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.onboarding.update");
  const item = await db.onboarding.getOnboarding(params.id!);
  if (!item) {
    redirect("/admin/onboarding/onboardings");
  }
  return {
    item,
    metadata: await OnboardingService.getMetadata(),
  };
}

export default async function OnboardingDetailsPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const params = (await props.params) || {};

  return <OnboardingDetailsClient item={data.item} metadata={data.metadata} itemId={params.id!} />;
}
