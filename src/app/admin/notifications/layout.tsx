import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { ReactNode } from "react";
import NotificationsLayoutClient from "./NotificationsLayoutClient";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  if (!process.env.NOTIFICATIONS_NOVU_API_KEY) {
    throw Error("NOTIFICATIONS_NOVU_API_KEY env variable required.");
  } else if (!process.env.NOTIFICATIONS_NOVU_APP_ID) {
    throw Error("NOTIFICATIONS_NOVU_APP_ID env variable required.");
  }
  await verifyUserHasPermission("admin.notifications.view");

  return {
    title: `${t("notifications.title")} | ${process.env.APP_NAME}`,
  };
}

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return <NotificationsLayoutClient>{children}</NotificationsLayoutClient>;
}
