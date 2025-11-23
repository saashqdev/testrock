"use client";

import { AnalyticsEvent, AnalyticsUniqueVisitor } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateUtils from "@/lib/shared/DateUtils";
import Tabs from "@/components/ui/tabs/Tabs";

type AnalyticsEventsClientProps = {
  items: (AnalyticsEvent & { uniqueVisitor: AnalyticsUniqueVisitor })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

export default function AnalyticsEventsClient({ items, filterableProperties, pagination }: AnalyticsEventsClientProps) {
  const { t } = useTranslation();

  return (
    <EditPageLayout>
      <div className="flex justify-between gap-2">
        <Tabs
          tabs={[
            { name: t("analytics.overview"), routePath: "/admin/analytics/overview" },
            { name: t("analytics.uniqueVisitors"), routePath: "/admin/analytics/visitors" },
            { name: t("analytics.pageViews"), routePath: "/admin/analytics/page-views" },
            { name: t("analytics.events"), routePath: "/admin/analytics/events" },
            { name: t("analytics.settings"), routePath: "/admin/analytics/settings" },
          ]}
          className="grow"
        />
        <InputFilters filters={filterableProperties} />
      </div>
      <TableSimple
        items={items}
        pagination={pagination}
        headers={[
          {
            name: "date",
            title: "Date",
            value: (i) => (
              <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-xs text-muted-foreground">
                {DateUtils.dateAgo(i.createdAt)}
              </time>
            ),
          },
          {
            name: "action",
            title: "Action",
            value: (i) => i.action,
          },
          {
            name: "category",
            title: "Category",
            value: (i) => i.category,
          },
          {
            name: "label",
            title: "Label",
            value: (i) => i.label,
          },
          {
            name: "value",
            title: "Value",
            value: (i) => i.value,
          },
          {
            name: "url",
            title: "URL",
            value: (i) => i.url,
          },
          {
            name: "cookie",
            title: "Cookie",
            value: (i) => <div className="truncate">{i.uniqueVisitor.cookie}</div>,
            className: "max-w-xs",
          },
          {
            name: "httpReferrer",
            title: "HTTP Referrer",
            value: (i) => i.uniqueVisitor.httpReferrer,
          },
          {
            name: "browser",
            title: "Browser",
            value: (i) => i.uniqueVisitor.browser,
          },
          {
            name: "os",
            title: "OS",
            value: (i) => i.uniqueVisitor.os,
          },
          {
            name: "device",
            title: "Device",
            value: (i) => i.uniqueVisitor.device,
          },
          {
            name: "source",
            title: "Source",
            value: (i) => i.uniqueVisitor.source,
          },
          {
            name: "medium",
            title: "Medium",
            value: (i) => i.uniqueVisitor.medium,
          },
          {
            name: "campaign",
            title: "Campaign",
            value: (i) => i.uniqueVisitor.campaign,
          },
          {
            name: "content",
            title: "Content",
            value: (i) => i.uniqueVisitor.content,
          },
          {
            name: "term",
            title: "Term",
            value: (i) => i.uniqueVisitor.term,
          },
          {
            name: "country",
            title: "Country",
            value: (i) => i.uniqueVisitor.country,
          },
          {
            name: "city",
            title: "City",
            value: (i) => i.uniqueVisitor.city,
          },
          {
            name: "fromUrl",
            title: "From URL",
            value: (i) => i.uniqueVisitor.fromUrl,
          },
          {
            name: "fromRoute",
            title: "From Route",
            value: (i) => i.uniqueVisitor.fromRoute,
          },
        ]}
      />
    </EditPageLayout>
  );
}
