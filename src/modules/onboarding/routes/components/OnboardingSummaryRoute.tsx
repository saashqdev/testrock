"use client";

import { useTranslation } from "react-i18next";
import NumberUtils from "@/lib/shared/NumberUtils";
import OnboardingSessionsTable from "../../components/OnboardingSessionsTable";
import { OnboardingSummaryApi } from "../api/OnboardingSummaryApi.server";

export default function OnboardingSummaryRoute({ data }: { data: OnboardingSummaryApi.LoaderData }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6 text-foreground">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Onboarding sessions</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-foreground">
            <div>
              {NumberUtils.intFormat(data.summary.sessions.active)}/{NumberUtils.intFormat(data.summary.sessions.all)}
            </div>
            <div className="text-sm font-normal lowercase text-muted-foreground">{t("shared.active")}</div>
          </dd>
        </div>
        <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Dismissed</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.summary.sessions.dismissed)}</dd>
        </div>
        <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Completed</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.summary.sessions.completed)}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-4">
        <h3 className="font-medium leading-4 text-foreground">Latest sessions</h3>
        <OnboardingSessionsTable items={data.sessions.items} metadata={data.sessions.metadata} />
      </div>
    </div>
  );
}
