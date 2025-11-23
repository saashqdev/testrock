import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import OnboardingStepsService from "@/modules/onboarding/services/OnboardingStepsService";
import OnboardingStepsClient from "../steps-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  item: OnboardingWithDetailsDto;
};

async function getData(props: IServerComponentsProps): Promise<PageData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.onboarding.update");

  const item = await db.onboarding.getOnboarding(params.id!);
  if (!item) {
    redirect("/admin/onboarding/onboardings");
  }

  return { item };
}

async function setSteps(formData: FormData, onboardingId: string) {
  "use server";

  const { t } = await getServerTranslations();

  const item = await db.onboarding.getOnboarding(onboardingId);
  if (!item) {
    return { error: "Onboarding not found" };
  }

  try {
    await OnboardingStepsService.setSteps({ item, form: formData, t });
    return { success: "Onboarding steps updated" };
  } catch (e: any) {
    return { error: e.message };
  }
}

export default async function OnboardingStepsPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getData(props);

  return <OnboardingStepsClient data={data} setSteps={setSteps} onboardingId={params.id!} />;
}
