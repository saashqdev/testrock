"use client";

import { FeatureFlagsModel } from "@/db/models";
import { FeatureFlagWithEventsDto } from "@/db/models/featureFlags/FeatureFlagsModel";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import TableSimple from "@/components/ui/tables/TableSimple";
import InputCheckbox from "@/components/ui/input/InputCheckbox";
import DateCell from "@/components/ui/dates/DateCell";
import { toggleFeatureFlag } from "../actions";
import { useTransition } from "react";

interface FeatureFlagsClientProps {
  items: FeatureFlagWithEventsDto[];
}

export default function FeatureFlagsClient({ items }: FeatureFlagsClientProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function countStatus(enabled?: boolean) {
    if (enabled === undefined) {
      return items.length;
    }
    return items.filter((item) => item.enabled === enabled).length;
  }

  function onToggle(item: FeatureFlagsModel, enabled: boolean) {
    startTransition(async () => {
      await toggleFeatureFlag(item.id, enabled);
    });
  }

  function filteredItems() {
    if (searchParams.get("status") === "active") {
      return items.filter((item) => item.enabled);
    }
    if (searchParams.get("status") === "inactive") {
      return items.filter((item) => !item.enabled);
    }
    return items;
  }

  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-grow">
          <TabsWithIcons
            tabs={[
              {
                name: `All ${countStatus() ? `(${countStatus()})` : ""}`,
                href: "?",
                current: !searchParams.get("status") || searchParams.get("status") === "all",
              },
              {
                name: `Active ${countStatus(true) ? `(${countStatus(true)})` : ""}`,
                href: "?status=active",
                current: searchParams.get("status") === "active",
              },
              {
                name: `Inactive ${countStatus(false) ? `(${countStatus(false)})` : ""}`,
                href: "?status=inactive",
                current: searchParams.get("status") === "inactive",
              },
            ]}
          />
        </div>
        <div>
          <ButtonPrimary to="flags/new">
            <div>{t("shared.new")}</div>
            <PlusIcon className="h-5 w-5" />
          </ButtonPrimary>
        </div>
      </div>

      {items.length === 0 && <InfoBanner title="Demo" text={t("featureFlags.empty.demo")} />}

      <TableSimple
        items={filteredItems()}
        actions={[
          {
            title: t("shared.overview"),
            onClickRoute: (_, i) => `${i.id}`,
          },
        ]}
        headers={[
          {
            name: "status",
            title: "Status",
            value: (i) => {
              return <InputCheckbox asToggle value={i.enabled} setValue={(checked) => onToggle(i, Boolean(checked))} disabled={isPending} />;
            },
          },
          {
            name: "featureFlag",
            title: t("featureFlags.object"),
            className: "w-full",
            value: (i) => (
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <div className="text-base font-bold">{i.description}</div>
                  <SimpleBadge title={i.name} color={Colors.GRAY} />
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Link href={"/admin/analytics/events?featureFlagId=" + i.id} className="lowercase">
                    {i.events.length} {t("featureFlags.triggers")}
                  </Link>
                  <div>•</div>
                  <div>
                    {i.filters.length === 0 ? (
                      <span>{t("featureFlags.noFilters")}</span>
                    ) : i.filters.length === 1 ? (
                      <span>{t("featureFlags.filter")}: </span>
                    ) : (
                      <span className="lowercase">
                        {i.filters.length} {t("featureFlags.filters")}:{" "}
                      </span>
                    )}
                    {i.filters.map((f) => f.type).join(", ")}
                  </div>
                </div>
              </div>
            ),
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => <DateCell date={i.createdAt} />,
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">{t("featureFlags.empty.title")}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{t("featureFlags.empty.description")}</p>
          </div>
        }
      />
    </div>
  );
}
