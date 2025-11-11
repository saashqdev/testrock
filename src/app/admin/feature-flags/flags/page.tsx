import { FeatureFlagWithEventsDto } from "@/db/models/featureFlags/FeatureFlagsModel";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { Metadata } from "next";
import FeatureFlagsClient from "./FeatureFlagsClient";


type LoaderData = {
  title: string;
  items: FeatureFlagWithEventsDto[];
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("featureFlags.title")} | ${process.env.APP_NAME}`,
  };
}

async function getData(): Promise<LoaderData> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("featureFlags.title")} | ${process.env.APP_NAME}`,
    items: await db.featureFlags.getFeatureFlagsWithEvents({ enabled: undefined }),
  };
}

export default async function FeatureFlagsPage() {
  const data = await getData();
  
  return <FeatureFlagsClient items={data.items} />;
}
