import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import FeatureFlagsOverview from "./FeatureFlagsOverview";

type LoaderData = {
  summary: {
    flagsTotal: number;
    flagsEnabled: number;
    triggersTotal: number;
  };
};

async function getData(): Promise<LoaderData> {
  const items = await db.featureFlags.getAllFeatureFlags();
  const triggersTotal = await prisma.analyticsEvent.count({
    where: { featureFlagId: { not: null } },
  });
  return {
    summary: {
      flagsTotal: items.length,
      flagsEnabled: items.filter((f) => f.enabled).length,
      triggersTotal,
    },
  };
}

export default async function FeatureFlagsPage() {
  const data = await getData();
  
  return <FeatureFlagsOverview summary={data.summary} />;
}
