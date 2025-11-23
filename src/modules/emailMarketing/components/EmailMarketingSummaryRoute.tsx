"use client";

import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import NumberUtils from "@/lib/shared/NumberUtils";
import { LoaderData } from "../routes/EmailMarketing_Summary";

interface EmailMarketingSummaryRouteProps {
  data: LoaderData;
}

export default function EmailMarketingSummaryRoute({ data }: EmailMarketingSummaryRouteProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6 text-foreground">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>{t("emailMarketing.overview.avgOpenRate")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.decimalFormat(data.summary.avgOpenRate)}%</dd>
        </div>
        <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>{t("emailMarketing.overview.avgClickRate")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.decimalFormat(data.summary.avgClickRate)}%</dd>
        </div>
        <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-muted-foreground">
            <ColorBadge color={Colors.GREEN} />
            <div>{t("emailMarketing.overview.totalSent")}</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-foreground">
            <div>
              {NumberUtils.numberFormat(data.summary.outboundEmails.delivered)}/{NumberUtils.numberFormat(data.summary.outboundEmails.sent)}
            </div>
            <div className="text-xs font-normal lowercase text-muted-foreground">{t("emails.delivered")}</div>
          </dd>
        </div>
      </dl>
    </div>
  );
}
