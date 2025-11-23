import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import CreditsList from "@/modules/usage/components/CreditsList";
import { CreditsWithDetailsDto } from "@/db/models/subscriptions/CreditsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import { headers } from "next/headers";

type LoaderData = {
  items: CreditsWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  canDelete: boolean;
};

async function getCreditsData(searchParams: URLSearchParams): Promise<LoaderData> {
  const headersList = await headers();
  const request = new Request(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}?${searchParams.toString()}`, {
    headers: headersList as any,
  });

  await verifyUserHasPermission("admin.apiKeys.view");
  const { t } = await getServerTranslations();

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: [
        { value: "null", name: "{null}" },
        ...(await db.tenants.adminGetAllTenantsIdsAndNames()).map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: [
        { value: "null", name: "{null}" },
        ...(await db.users.adminGetAllUsersNames()).map((item) => {
          return {
            value: item.id,
            name: item.email,
          };
        }),
      ],
    },
  ];

  const currentPagination = getPaginationFromCurrentUrl(searchParams);
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await db.credits.getAllCredits({ tenantId: null, filters, filterableProperties, pagination: currentPagination });

  return {
    items,
    filterableProperties,
    pagination,
    canDelete: true,
  };
}

export default async function CreditsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();

  // Convert searchParams to URLSearchParams
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.append(key, value);
      }
    }
  });

  const data = await getCreditsData(urlSearchParams);
  const { t } = await getServerTranslations();

  return (
    <EditPageLayout title={t("models.credit.plural")}>
      <CreditsList data={data} />
    </EditPageLayout>
  );
}
