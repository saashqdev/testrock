"use server";

import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { ApplicationEvents } from "@/modules/events/types/ApplicationEvent";
import EventsTable from "@/modules/events/components/EventsTable";
import InputFilters from "@/components/ui/input/InputFilters";
import { getServerTranslations } from "@/i18n/server";
import { EventWithAttemptsDto } from "@/db/models/events/EventsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { headers } from "next/headers";

type LoaderData = {
  title: string;
  items: EventWithAttemptsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

async function loader(searchParams: URLSearchParams): Promise<LoaderData> {
  await verifyUserHasPermission("admin.events.view");
  const { t } = await getServerTranslations();

  const current = getPaginationFromCurrentUrl(searchParams);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "name",
      title: "Event",
      options: ApplicationEvents.map((item) => {
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
      name: "tenantId",
      title: t("models.tenant.object"),
      options: [
        { name: "- No tenant -", value: "{null}" },
        ...(await db.tenants.adminGetAllTenantsIdsAndNames()).map((i) => {
          return { value: i.id, name: i.name };
        }),
      ],
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: (await db.users.adminGetAllUsersNames()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];

  // Create a mock request for getFiltersFromCurrentUrl
  const heads = await headers();
  const baseUrl = heads.get("x-forwarded-host") || "localhost:3000";
  const protocol = heads.get("x-forwarded-proto") || "http";
  const url = new URL(`${protocol}://${baseUrl}/admin/events?${searchParams.toString()}`);
  const request = new Request(url.toString());

  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await db.events.getEvents({ current, filters });

  const data: LoaderData = {
    title: `${t("models.event.plural")} | ${process.env.APP_NAME}`,
    items,
    pagination,
    filterableProperties,
  };
  return data;
}

export default async function AdminEventsRoute(props: IServerComponentsProps) {
  const searchParams = await props.searchParams;
  const urlSearchParams = new URLSearchParams();

  // Convert searchParams to URLSearchParams
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => urlSearchParams.append(key, v));
        } else {
          urlSearchParams.set(key, value);
        }
      }
    });
  }

  const data = await loader(urlSearchParams);
  const { t } = await getServerTranslations();

  return (
    <EditPageLayout
      title={t("models.event.plural")}
      buttons={
        <>
          <InputFilters size="sm" filters={data.filterableProperties} />
        </>
      }
    >
      <EventsTable items={data.items} pagination={data.pagination} />
    </EditPageLayout>
  );
}
