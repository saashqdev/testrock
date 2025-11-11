"use client";

import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import { AnalyticsOverviewDto } from "@/lib/helpers/server/AnalyticsService";
import PeriodHelper, { PeriodFilters, defaultPeriodFilter } from "@/lib/helpers/PeriodHelper";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import InputSelect from "@/components/ui/input/InputSelect";

type LoaderData = {
  item: PortalWithDetailsDto & { portalUrl?: string };
  overview: AnalyticsOverviewDto;
};

export default function AnalyticsClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <EditPageLayout
      title={t("analytics.title")}
      withHome={false}
      buttons={
        <>
          <InputSelect
            className="w-44"
            name="period"
            value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
            options={PeriodFilters.map((f) => {
              return {
                value: f.value,
                name: t(f.name),
              };
            })}
            onChange={(value) => {
              const params = new URLSearchParams(searchParams.toString());
              if (value && value !== defaultPeriodFilter) {
                params.set("period", value?.toString() ?? "");
              } else {
                params.delete("period");
              }
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
          {data.item.portalUrl && (
            <ButtonPrimary to={data.item.portalUrl} target="_blank" disabled={!data.item.isPublished}>
              <div className="flex items-center space-x-2">
                <ExternalLinkEmptyIcon className="h-4 w-4" />
              </div>
            </ButtonPrimary>
          )}
        </>
      }
    >
      <div className="space-y-2 pb-10">
        <AnalyticsOverview overview={data.overview} withUsers={false} />
      </div>
    </EditPageLayout>
  );
}
