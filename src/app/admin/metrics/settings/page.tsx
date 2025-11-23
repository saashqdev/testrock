import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { MetricsSettingsClient } from "./settings-client";

type LoaderData = {
  totalMetricLogs: number;
  appConfiguration: AppConfigurationDto;
};

async function loadData(): Promise<LoaderData> {
  await verifyUserHasPermission("admin.metrics.view");
  await db.appConfiguration.getOrCreateAppConfiguration();
  const config = await db.appConfiguration.getAppConfiguration();
  const data: LoaderData = {
    totalMetricLogs: await prisma.metricLog.count(),
    appConfiguration: {
      ...config,
      app: {
        ...config.app,
        theme: typeof config.app.theme === "string" ? { color: config.app.theme, scheme: "system" as const } : config.app.theme,
      },
    },
  };
  return data;
}

export default async function MetricsSettingsPage() {
  const data = await loadData();

  return <MetricsSettingsClient initialData={data} />;
}
