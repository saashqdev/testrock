import { FeatureFlag, FeatureFlagFilter, Role, Tenant } from "@prisma/client";
import { redirect } from "next/navigation";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { db } from "@/db";
import Component from "./component";

type LoaderData = {
  item: FeatureFlag & { filters: FeatureFlagFilter[] };
  metadata: {
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
};

const loader = async (id: string): Promise<LoaderData> => {
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
  const item = await db.featureFlags.getFeatureFlag({ id, enabled: undefined });
  if (!item) {
    redirect("/admin/feature-flags/flags");
  }
  const data: LoaderData = {
    item,
    metadata,
  };
  return data;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FeatureFlagEditPage({ params }: PageProps) {
  const { id } = await params;
  const data = await loader(id);
  
  return <Component data={data} id={id} />;
}
