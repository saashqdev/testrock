import Link from "next/link";
import { Fragment } from "react";
import { getServerTranslations } from "@/i18n/server";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ServerError from "@/components/ui/errors/ServerError";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiKeyLogsSummary from "@/modules/api/components/ApiKeyLogsSummary";
import { ApiCallSummaryDto } from "@/modules/api/dtos/ApiCallSummaryDto";
import ApiKeyLogService from "@/modules/api/services/ApiKeyLogService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { headers } from "next/headers";

type LoaderData =
  | { error: string }
  | {
      items: ApiCallSummaryDto[];
      allTenants: { id: string; name: string; slug: string }[];
      filterableProperties: FilterablePropertyDto[];
    };

async function getData(searchParams: URLSearchParams): Promise<LoaderData> {
  await verifyUserHasPermission("admin.apiKeys.view");
  try {
    const headersList = await headers();
    const request = new Request(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}?${searchParams.toString()}`, {
      headers: headersList as any,
    });

    const { items, allTenants, filterableProperties } = await ApiKeyLogService.getSummary({
      request,
      params: {},
    });
    const data: LoaderData = {
      items,
      allTenants,
      filterableProperties,
    };
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

export default async function AdminApiPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { t } = await getServerTranslations();
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.append(key, value);
      }
    }
  });

  const data = await getData(urlSearchParams);
  return (
    <EditPageLayout title={t("shared.overview")}>
      {"error" in data ? (
        <ErrorBanner title={t(data.error)}>
          <Link href="." className="underline">
            {t("shared.clickHereToTryAgain")}
          </Link>
        </ErrorBanner>
      ) : (
        <Fragment>
          <ApiKeyLogsSummary data={data} />
        </Fragment>
      )}
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
