"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import InputSelector from "@/components/ui/input/InputSelector";
import Tabs from "@/components/ui/tabs/Tabs";
import { defaultPeriodFilter, PeriodFilters } from "@/lib/helpers/PeriodHelper";
import { AnalyticsOverviewDto } from "@/lib/helpers/server/AnalyticsService";

interface AnalyticsOverviewClientProps {
  overview: AnalyticsOverviewDto;
}

export default function AnalyticsOverviewClient({ overview }: AnalyticsOverviewClientProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const newSearchParams = new URLSearchParams(searchParams.toString() || "");

  return (
    <>
      <div className="flex justify-between gap-2">
        <Tabs
          breakpoint="lg"
          tabs={[
            { name: t("analytics.overview"), routePath: "/admin/analytics/overview" },
            { name: t("analytics.uniqueVisitors"), routePath: "/admin/analytics/visitors" },
            { name: t("analytics.pageViews"), routePath: "/admin/analytics/page-views" },
            { name: t("analytics.events"), routePath: "/admin/analytics/events" },
            { name: t("analytics.settings"), routePath: "/admin/analytics/settings" },
          ]}
          className="grow"
        />

        <InputSelector
          className="w-44"
          withSearch={false}
          name="period"
          value={newSearchParams.get("period")?.toString() ?? defaultPeriodFilter}
          options={PeriodFilters.map((f) => {
            return {
              value: f.value,
              name: t(f.name),
            };
          })}
          setValue={(value) => {
            if (value && value !== defaultPeriodFilter) {
              newSearchParams.set("period", value?.toString() ?? "");
            } else {
              newSearchParams.delete("period");
            }
            router.push(`?${newSearchParams.toString()}`);
          }}
        />
      </div>

      <AnalyticsOverview overview={overview} withUsers={true} rootUrl="/admin/analytics/" />
    </>
  );
}
