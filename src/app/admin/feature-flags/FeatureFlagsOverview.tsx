"use client";

import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import NumberUtils from "@/lib/shared/NumberUtils";

type FeatureFlagsOverviewProps = {
  summary: {
    flagsTotal: number;
    flagsEnabled: number;
    triggersTotal: number;
  };
};

export default function FeatureFlagsOverview({ summary }: FeatureFlagsOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-background px-4 py-3 shadow">
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-muted-foreground">
            <ColorBadge color={Colors.GREEN} />
            <div>{t("featureFlags.plural")}</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold">
            <div>
              {NumberUtils.numberFormat(summary.flagsEnabled)}/{NumberUtils.numberFormat(summary.flagsTotal)}
            </div>
            <div className="text-xs font-normal lowercase text-muted-foreground">{t("featureFlags.enabled")}</div>
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-background px-4 py-3 shadow">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>{t("featureFlags.triggers")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold">{NumberUtils.intFormat(summary.triggersTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
