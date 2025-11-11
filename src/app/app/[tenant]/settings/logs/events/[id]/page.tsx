import { redirect } from "next/navigation";
import EventDetails from "@/modules/events/components/EventDetails";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { EventWithDetailsDto } from "@/db/models/events/EventsModel";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

type LoaderData = {
  item: EventWithDetailsDto;
};

async function getEventData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;  
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.auditTrails.view", tenantId);
  const item = await db.events.getEvent(params.id ?? "");
  if (!item) {
    redirect(UrlUtils.getModulePath(params, "logs/events"));
  }

  return {
    item,
  };
}

export default async function AppEventDetailsRoute(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await getEventData(props);
  const params = (await props.params) || {};
  
  return (
    <EditPageLayout
      title={t("models.event.object")}
      withHome={false}
      menu={[
        {
          title: t("models.event.plural"),
          routePath: UrlUtils.getModulePath(params, "logs/events"),
        },
        {
          title: data.item.name,
        },
      ]}
    >
      <EventDetails item={data.item} />
    </EditPageLayout>
  );
}
