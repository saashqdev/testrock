import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { OutboundEmailWithDetailsDto } from "@/db/models/email/OutboundEmailsModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  items: OutboundEmailWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
  allEntities: EntityWithDetailsDto[];
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;    
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const emailSenders = await db.emailSenders.getAllEmailSenders(tenantId);
  const campaigns = await db.campaigns.getAllCampaigns(tenantId);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "senderId",
      title: "Sender",
      options: [
        ...emailSenders.map((i) => {
          return {
            value: i.id,
            name: i.fromEmail + " (" + i.provider + ")",
          };
        }),
      ],
    },
    {
      name: "campaignId",
      title: "Campaign",
      options: [
        { name: "{Preview}", value: "null" },
        ...campaigns.map((i) => {
          return {
            value: i.id,
            name: i.name,
          };
        }),
      ],
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request?.url || "http://localhost").searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const fromSenderId = filters.properties.find((f) => f.name === "senderId")?.value ?? undefined;
  const campaignId = filters.properties.find((f) => f.name === "campaignId")?.value;
  const { items, pagination } = await db.outboundEmails.getAllOutboundEmails(tenantId, {
    where: {
      fromSenderId,
      campaignId: campaignId === "null" ? null : campaignId ?? undefined,
    },
    pagination: currentPagination,
  });
  const data: LoaderData = {
    items,
    pagination,
    filterableProperties,
    allEntities: await db.entities.getAllEntities(null),
  };
  return data;
};

