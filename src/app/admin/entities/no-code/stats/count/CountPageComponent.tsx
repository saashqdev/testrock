"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import InputSelector from "@/components/ui/input/InputSelector";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

enum FilterType {
  Last30Days = "last-30-days",
  Last7Days = "last-7-days",
}
const defaultFilter = FilterType.Last30Days;

type EntityCountDto = {
  entity: EntityWithDetailsDto;
  href?: string;
  count: number;
};
type LoaderData = {
  summary: EntityCountDto[];
};

export default function CountPageComponent({ initialData }: { initialData: LoaderData }) {
  const { t } = useTranslation();
  const [data] = useState<LoaderData>(initialData);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  return (
    <div className="space-y-5 p-8">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="grow text-lg font-medium leading-6 text-foreground">Summary</h3>
        <div>
          <InputSelector
            className="w-44"
            withSearch={false}
            name="count"
            value={newSearchParams.get("count")?.toString() ?? defaultFilter}
            options={[
              { name: t("app.shared.periods.LAST_30_DAYS"), value: FilterType.Last30Days },
              { name: t("app.shared.periods.LAST_7_DAYS"), value: FilterType.Last7Days },
            ]}
            setValue={(value) => {
              if (value) {
                newSearchParams.set("count", value?.toString() ?? "");
              } else {
                newSearchParams.delete("count");
              }
              startTransition(() => {
                router.push(`?${newSearchParams.toString()}`);
              });
            }}
          />
        </div>
      </div>
      <dl
        className={clsx(
          "grid grid-cols-1 gap-5",
          data.summary.length === 2 && "sm:grid-cols-2",
          data.summary.length === 3 && "sm:grid-cols-3",
          data.summary.length === 4 && "sm:grid-cols-4",
          data.summary.length === 5 && "sm:grid-cols-3",
          data.summary.length === 6 && "sm:grid-cols-3"
        )}
      >
        {data.summary.map((item, idx) => (
          <div key={idx} className="shadow-xs overflow-hidden rounded-lg bg-background">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-muted-foreground">{t(item.entity.titlePlural)}</dt>
                    <dd>
                      <div className="text-lg font-medium text-foreground">
                        <span>{isPending ? "..." : item.count}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {item.href && (
              <div className="bg-secondary px-5 py-3">
                <div className="text-sm">
                  <a href={item.href} className="font-medium text-theme-700 hover:text-theme-900">
                    View all
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
