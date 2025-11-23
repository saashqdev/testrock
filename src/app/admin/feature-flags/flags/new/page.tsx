import { Role, Tenant } from "@prisma/client";
import { redirect } from "next/navigation";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { getServerTranslations } from "@/i18n/server";
import FeatureFlagForm from "@/modules/featureFlags/components/FeatureFlagForm";
import { FeatureFlagsFilterType } from "@/modules/featureFlags/dtos/FeatureFlagsFilterTypes";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { db } from "@/db";

type MetadataType = {
  users: UserDto[];
  tenants: Tenant[];
  subscriptionProducts: SubscriptionProductDto[];
  roles: Role[];
  analytics: {
    via: { name: string; count: number }[];
    httpReferrer: { name: string; count: number }[];
    browser: { name: string; count: number }[];
    os: { name: string; count: number }[];
    source: { name: string; count: number }[];
    medium: { name: string; count: number }[];
    campaign: { name: string; count: number }[];
  };
};

async function getMetadata(): Promise<MetadataType> {
  const metadata = {
    users: (await db.users.adminGetAllUsers()).items,
    tenants: await db.tenants.adminGetAllTenants(),
    subscriptionProducts: await db.subscriptionProducts.getAllSubscriptionProducts(),
    roles: await db.roles.getAllRoles(),
    analytics: {
      via: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("via"),
      httpReferrer: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("httpReferrer"),
      browser: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("browser"),
      os: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("os"),
      source: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("source"),
      medium: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("medium"),
      campaign: await db.analyticsUniqueVisitors.groupUniqueVisitorsBy("campaign"),
    },
  };
  return metadata;
}

async function createFeatureFlag(prevState: any, formData: FormData) {
  "use server";

  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();

  if (action === "new") {
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();

    const filters: {
      type: FeatureFlagsFilterType;
      value: string | null;
      action: string | null;
    }[] = formData.getAll("filters[]").map((f) => {
      return JSON.parse(f.toString());
    });

    if (!name || !description) {
      return { error: "Missing required fields." };
    }

    const existingFlag = await db.featureFlags.getFeatureFlag({ name, description });
    if (existingFlag) {
      return { error: "Flag with this name and description already exists." };
    }

    try {
      await db.featureFlags.createFeatureFlag({ name, description, enabled: false, filters });
      redirect("/admin/feature-flags/flags");
    } catch (e: any) {
      return { error: e.message };
    }
  } else {
    return { error: t("shared.invalidForm") };
  }
}

export default async function NewFeatureFlagPage() {
  const metadata = await getMetadata();

  return (
    <div>
      <FeatureFlagForm item={undefined} metadata={metadata} action={createFeatureFlag} />
    </div>
  );
}
