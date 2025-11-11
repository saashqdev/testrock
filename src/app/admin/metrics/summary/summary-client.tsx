"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { RowHeaderDisplayDto } from "@/components/ui/tables/TableSimple";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import InputCombobox from "@/components/ui/input/InputCombobox";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { FilterableValueLink } from "@/components/ui/links/FilterableValueLink";
import TableSimple from "@/components/ui/tables/TableSimple";
import SpeedBadge from "@/modules/metrics/components/SpeedBadge";
import NumberUtils from "@/lib/shared/NumberUtils";

const defaultGroupBy = ["function"];

type ItemDto = {
  userId: string | null;
  tenantId: string | null;
  function: string;
  route: string;
  url: string;
  env: string;
  type: string;
  _avg: {
    duration: number | null;
  };
  _count: {
    _all: number;
  };
};

type LoaderData = {
  items: ItemDto[];
  users: { id: string; email: string }[];
  tenants: { id: string; name: string }[];
  filterableProperties: any[];
};

function getGroupByValues(searchParams: URLSearchParams) {
  const groupByValues = searchParams
    .getAll("groupBy")
    .filter((x) => x)
    .sort();
  return groupByValues.length > 0 ? groupByValues : defaultGroupBy;
}

export default function MetricsSummaryClient({ initialData }: { initialData: LoaderData }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const [groupBy, setGroupBy] = useState<string[]>(getGroupByValues(newSearchParams));

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<ItemDto>[]>([]);

  useEffect(() => {
    if (getGroupByValues(newSearchParams).sort().join(",") !== groupBy.sort().join(",")) {
      newSearchParams.delete("groupBy");
      groupBy.forEach((by) => {
        newSearchParams.append("groupBy", by);
      });
      router.push(`?${newSearchParams.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<ItemDto>[] = [];
    let currentGroupBy = groupBy;
    if (currentGroupBy.length === 0) {
      currentGroupBy = defaultGroupBy;
    }
    const getCountLink = (item: ItemDto) => {
      const searchParams = new URLSearchParams();
      searchParams.set("pageSize", "100");
      currentGroupBy.forEach((groupBy) => {
        if (groupBy === "function") {
          searchParams.append("function", item.function);
        } else if (groupBy === "route") {
          searchParams.append("route", item.route);
        } else if (groupBy === "url") {
          searchParams.append("url", item.url);
        } else if (groupBy === "env") {
          searchParams.append("env", item.env);
        } else if (groupBy === "type") {
          searchParams.append("type", item.type);
        } else if (groupBy === "userId") {
          searchParams.append("userId", item.userId ?? "null");
        } else if (groupBy === "tenantId") {
          searchParams.append("tenantId", item.tenantId ?? "null");
        }
      });
      return `/admin/metrics/logs?${searchParams.toString()}`;
    };
    const getUser = (item: ItemDto) => {
      return initialData.users.find((x) => x.id === item.userId);
    };
    const getTenant = (item: ItemDto) => {
      return initialData.tenants.find((x) => x.id === item.tenantId);
    };
    if (groupBy.includes("env")) {
      headers.push({
        name: "env",
        title: "Env",
        value: (item) => <FilterableValueLink name="env" value={item.env} />,
      });
    }
    if (groupBy.includes("type")) {
      headers.push({
        name: "type",
        title: "Type",
        value: (item) => <FilterableValueLink name="type" value={item.type} />,
      });
    }
    if (groupBy.includes("route")) {
      headers.push({
        name: "route",
        title: "Route name",
        value: (item) => <FilterableValueLink name="route" value={item.route} />,
      });
    }
    if (groupBy.includes("url")) {
      headers.push({
        name: "url",
        title: "URL",
        value: (item) => <FilterableValueLink name="url" value={item.url} />,
      });
    }
    if (groupBy.includes("function")) {
      headers.push({
        name: "function",
        title: "Function",
        value: (item) => (
          <div className={clsx(item.function === "_unidentifiedFunction_" && "text-red-500")}>
            <FilterableValueLink name="function" value={item.function} />
          </div>
        ),
        className: "w-full",
      });
    }
    if (groupBy.includes("userId")) {
      headers.push({
        name: "userId",
        title: "User",
        value: (item) => <FilterableValueLink name="userId" value={getUser(item)?.email ?? ""} />,
      });
    }
    if (groupBy.includes("tenantId")) {
      headers.push({
        name: "tenantId",
        title: "Tenant",
        value: (item) => <FilterableValueLink name="tenantId" value={getTenant(item)?.name ?? ""} />,
      });
    }
    headers.push({
      name: "count",
      title: "Count",
      value: (item) => (
        <Link href={getCountLink(item)} className="hover:underline">
          {NumberUtils.intFormat(Number(item._count._all))}
        </Link>
      ),
    });
    headers.push({
      name: "speed",
      title: "Speed",
      value: (item) => <SpeedBadge duration={Number(item._avg.duration)} />,
    });
    headers.push({
      name: "duration",
      title: "Avg. duration",
      value: (item) => <div>{NumberUtils.custom(Number(item._avg.duration), "0,0.001")} ms</div>,
    });

    setHeaders(headers);
  }, [initialData, groupBy]);

  return (
    <>
      <EditPageLayout
        tabs={[
          {
            name: "Summary",
            routePath: "/admin/metrics/summary",
          },
          {
            name: "All logs",
            routePath: "/admin/metrics/logs",
          },
          {
            name: "Settings",
            routePath: "/admin/metrics/settings",
          },
        ]}
      >
        <div className="space-y-2">
          <div className="flex w-full items-center space-x-2">
            <InputCombobox
              name="groupBy"
              prefix="Group by: "
              selectPlaceholder="Select group by"
              options={[
                { value: "env", name: "Env" },
                { value: "type", name: "Type" },
                { value: "route", name: "Route" },
                { value: "url", name: "URL" },
                { value: "userId", name: "User" },
                { value: "tenantId", name: "Tenant" },
                { value: "function", name: "Function" },
              ]}
              value={groupBy}
              onChange={(value) => {
                setGroupBy(value as string[]);
              }}
            />
            <div className="grow">{/* <InputSearchWithURL /> */}</div>
            <InputFilters size="sm" filters={initialData.filterableProperties} />
          </div>
          {groupBy.length === 0 ? (
            <WarningBanner title="Group by" text="Please select at least one group by" />
          ) : (
            <TableSimple items={initialData.items} headers={headers} />
          )}
        </div>
      </EditPageLayout>
    </>
  );
}
