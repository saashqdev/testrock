"use client";

import { Prisma } from "@prisma/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import InputSelector from "@/components/ui/input/InputSelector";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { RowsApi } from "@/utils/api/server/RowsApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import DateUtils from "@/lib/shared/DateUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

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
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;  
  const tenantId = await getTenantIdOrNull({ request, params });
  let entities: EntityWithDetailsDto[] = [];
  if (tenantId) {
    entities = await db.entities.getAllEntities(null);
  } else {
    entities = await db.entities.getAllEntities(null);
  }
  const userInfo = await getUserInfo();

  const rowWhere: Prisma.RowWhereInput = {};
  const searchParams = new URL(request.url).searchParams;
  const countFilter = searchParams.get("count") ?? defaultFilter;
  if (countFilter) {
    if (countFilter === "last-30-days") {
      rowWhere.createdAt = {
        gte: DateUtils.daysFromDate(new Date(), 30 * -1),
      };
    } else if (countFilter === "last-7-days") {
      rowWhere.createdAt = {
        gte: DateUtils.daysFromDate(new Date(), 7 * -1),
      };
    }
  }
  const summary: EntityCountDto[] = await Promise.all(
    entities.map(async (entity) => {
      return {
        entity,
        href: EntityHelper.getRoutes({ routes: EntitiesApi.getNoCodeRoutes({ request, params }), entity })?.list,
        count: await RowsApi.count({
          entity,
          tenantId,
          userId: userInfo.userId,
          rowWhere,
        }),
      };
    })
  );
  const data: LoaderData = {
    summary,
  };
  return data;
};

export default function CountPage({ initialData }: { initialData: LoaderData }) {
  const { t } = useTranslation();
  const [data, setData] = useState<LoaderData>(initialData);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  return (
    <div className="space-y-5 p-8">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-foreground grow text-lg font-medium leading-6">Summary</h3>
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
          <div key={idx} className="bg-background overflow-hidden rounded-lg shadow-xs">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate text-sm font-medium">{t(item.entity.titlePlural)}</dt>
                    <dd>
                      <div className="text-foreground text-lg font-medium">
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
                  <a href={item.href} className="text-theme-700 hover:text-theme-900 font-medium">
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
