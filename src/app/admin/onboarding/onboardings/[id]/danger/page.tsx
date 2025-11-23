import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import DangerZone from "./danger-client";

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

export default async function DangerZonePage(props: IServerComponentsProps) {
  const data = await getData(props);

  return <DangerZone item={data.item} />;
}
