import { headers } from "next/headers";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { ApplicationEvents } from "@/modules/events/types/ApplicationEvent";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { getServerTranslations } from "@/i18n/server";
import { EventWithAttemptsDto } from "@/db/models/events/EventsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import EventsClientWrapper from "./component";

type LoaderData = {
  title: string;
  items: EventWithAttemptsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

export default async function AppEventsRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  
  // Create a request object from Next.js context
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const urlSearchParams = new URLSearchParams(searchParams as Record<string, string>);
  const url = `${protocol}://${host}${props.request?.url || ""}?${urlSearchParams.toString()}`;
  const request = new Request(url);

  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.auditTrails.view", tenantId);
  const { t } = await getServerTranslations();

  const current = getPaginationFromCurrentUrl(urlSearchParams);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "name",
      title: "Event",
      options: ApplicationEvents.filter((f) => !f.adminOnly || !params.tenant).map((item) => {
        return {
          value: item.value,
          name: `${item.value} - ${item.name}`,
        };
      }),
    },
    {
      name: "data",
      title: "Data",
    },
    {
      name: "userId",
      title: "models.user.object",
      options: (await db.users.getUsersByTenant(tenantId)).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await db.events.getEvents({ current, filters }, tenantId);

  const data: LoaderData = {
    title: `${t("models.event.plural")} | ${process.env.APP_NAME}`,
    items,
    pagination,
    filterableProperties,
  };

  return (
    <EditPageLayout>
      <EventsClientWrapper 
        data={data} 
        params={params}
      />
    </EditPageLayout>
  );
}
