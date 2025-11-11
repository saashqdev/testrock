"use server";

import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import { getCurrentPagination, getStringFilter } from "@/lib/helpers/PaginationHelper";
import { db } from "@/db";
import CreditsList from "@/modules/credits/components/CreditsList";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { CreditTypes } from "@/modules/credits/dtos/CreditType";
import UrlUtils from "@/lib/utils/UrlUtils";
import { CreditsWithDetailsDto } from "@/db/models/subscriptions/CreditsModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getServerTranslations } from "@/i18n/server";
import { requireTenantSlug } from "@/lib/services/url.server";
import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";

type LoaderData = {
  items: CreditsWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
const loader = async (props: IServerComponentsProps) => {
  const searchParams = await props.searchParams;
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantSlug = await requireTenantSlug();
  const tenantId = await getTenantIdFromUrl(tenantSlug);
  await verifyUserHasPermission("app.settings.subscription.view", tenantId.id);
  if (CreditTypes.length === 0) {
    return redirect(UrlUtils.currentTenantUrl({ tenant: tenantSlug }, "settings"));
  }
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "userId",
      title: t("models.user.object"),
      options: [
        // { value: "null", name: "{null}" },
        ...(await db.users.adminGetAllTenantUsers(tenantId.id)).map((item) => {
          return {
            value: item.id,
            name: item.email,
          };
        }),
      ],
    },
    {
      name: "type",
      title: t("models.credit.type"),
      options: CreditTypes.map((item) => {
        return {
          value: item.value,
          name: item.name,
        };
      }),
    },
  ];
  const currentPagination = getCurrentPagination(searchParams);
  const filters = {
    properties: filterableProperties,
    tenantId,
    q: getStringFilter(searchParams, "q"),
    userId: getStringFilter(searchParams, "userId"),
    type: getStringFilter(searchParams, "type"),
  };
  const { items, pagination } = await db.credits.getAllCredits({
    tenantId: tenantId.id,
    filters,
    filterableProperties,
    pagination: {
      pageSize: currentPagination.pageSize,
      page: currentPagination.page,
    },
  });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
  };
  return data;
};

export default async function (props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await loader(props);
  return (
    <IndexPageLayout title={t("models.credit.plural")}>
      <CreditsList data={data} />
    </IndexPageLayout>
  );
}
