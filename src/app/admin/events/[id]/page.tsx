import { redirect } from "next/navigation";
import EventDetails from "@/modules/events/components/EventDetails";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

export default async function AdminEventDetailsRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();

  await verifyUserHasPermission("admin.events.view");
  const item = await db.events.getEvent(params.id ?? "");

  if (!item) {
    redirect(UrlUtils.getModulePath(params, "logs/events"));
  }

  return (
    <EditPageLayout
      title={t("models.event.object")}
      menu={[
        {
          title: "Events",
          routePath: "/admin/events",
        },
        {
          title: "Details",
          routePath: "/admin/events/" + item.id,
        },
      ]}
    >
      <EventDetails item={item} />
    </EditPageLayout>
  );
}
