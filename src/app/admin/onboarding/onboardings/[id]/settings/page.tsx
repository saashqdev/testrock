import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import OnboardingSettingsPage from "./settings-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function Page(props: IServerComponentsProps) {
  const params = (await props.params) || {};

  await verifyUserHasPermission("admin.onboarding.update");

  const item = await db.onboarding.getOnboarding(params.id!);
  if (!item) {
    redirect("/admin/onboarding/onboardings");
  }

  const metadata = {
    users: await db.users.adminGetAllUsersNames(),
    tenants: await db.tenants.adminGetAllTenants(),
    subscriptionProducts: await db.subscriptionProducts.getAllSubscriptionProducts(),
    roles: await db.roles.getAllRolesNames(),
  };

  const data = {
    meta: [],
    item,
    metadata,
  };

  return <OnboardingSettingsPage data={data} />;
}
