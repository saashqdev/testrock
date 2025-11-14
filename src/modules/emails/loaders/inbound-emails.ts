import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import { EmailWithSimpleDetailsDto } from "@/db/models/email/EmailsModel";
import { getPostmarkServer } from "@/lib/emails/postmark.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantDefaultInboundAddress } from "@/utils/services/emailService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderDataEmails = {
  title: string;
  items: EmailWithSimpleDetailsDto[];
  inboundEmailAddress?: any;
  error?: string;
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
  tenantId: string | null;
};
export const loaderEmails = async (props: IServerComponentsProps, tenantId: string | null) => {
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();

  let error = "";
  let inboundEmailAddress = "";
  const server = await getPostmarkServer();
  if (server?.InboundAddress) {
    if (!server.InboundDomain) {
      if (tenantId !== null) {
        error = `Invalid inbound domain`;
      } else {
        inboundEmailAddress = `${server.InboundAddress}`;
      }
    } else {
      if (tenantId === null) {
        inboundEmailAddress = `support@${server.InboundDomain}`;
      } else {
        const address = await getTenantDefaultInboundAddress(tenantId);
        if (address) {
          inboundEmailAddress = `${address}@${server.InboundDomain}`;
        } else {
          error = `Invalid account address`;
        }
      }
    }
  }

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "fromName",
      title: "models.email.fromName",
    },
    {
      name: "fromEmail",
      title: "models.email.fromEmail",
    },
    {
      name: "toName",
      title: "models.email.toName",
    },
    {
      name: "toEmail",
      title: "models.email.toEmail",
    },
    {
      name: "subject",
      title: "models.email.subject",
    },
    {
      name: "textBody",
      title: "models.email.textBody",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = request?.url ? new URL(request.url).searchParams : new URLSearchParams();
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);

  const { items, pagination } = await db.emails.getAllEmails("inbound", currentPagination, filters, tenantId);

  const data: LoaderDataEmails = {
    title: `${t("models.email.plural")} | ${process.env.APP_NAME}`,
    items,
    inboundEmailAddress,
    error,
    pagination,
    filterableProperties,
    tenantId,
  };
  return data;
};
