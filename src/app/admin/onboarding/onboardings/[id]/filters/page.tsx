import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingCandidateDto } from "@/modules/onboarding/dtos/OnboardingCandidateDto";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "@/modules/onboarding/services/OnboardingService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import OnboardingFiltersClient from "./filters-client";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetailsDto;
  candidates: OnboardingCandidateDto[];
  metadata: OnboardingFilterMetadataDto;
};

async function getData(props: IServerComponentsProps): Promise<PageData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.onboarding.update");
  
  const item = await db.onboarding.getOnboarding(params.id!);
  if (!item) {
    redirect("/admin/onboarding/onboardings");
  }

  const candidates = await OnboardingService.getCandidates(item);
  
  return {
    meta: [],
    item,
    candidates,
    metadata: await OnboardingService.getMetadata(),
  };
}

export default async function OnboardingFiltersPage(props: IServerComponentsProps) {
  const data = await getData(props);
  
  return <OnboardingFiltersClient data={data} />;
}
