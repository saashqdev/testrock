"use client";

import { AnalyticsUniqueVisitor } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateUtils from "@/lib/shared/DateUtils";
import Tabs from "@/components/ui/tabs/Tabs";

type LoaderData = {
  items: (AnalyticsUniqueVisitor & {
    _count: {
      pageViews: number;
      events: number;
    };
  })[];
  pagination: PaginationDto;
};

interface AdminAnalyticsVisitorsClientProps {
  data: LoaderData;
}

export default function AdminAnalyticsVisitorsClient({ data }: AdminAnalyticsVisitorsClientProps) {
  const { t } = useTranslation();

  return (
    <>
      <EditPageLayout>
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

        <div>
          <TableSimple
            items={data.items}
            pagination={data.pagination}
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
                name: "httpReferrer",
                title: "HTTP Referrer",
                value: (i) => i.httpReferrer,
              },
              {
                name: "via",
                title: "Via",
                value: (i) => i.via,
              },
              {
                name: "browser",
                title: "Browser",
                value: (i) => i.browser,
              },
              {
                name: "os",
                title: "OS",
                value: (i) => i.os,
              },
              {
                name: "device",
                title: "Device",
                value: (i) => i.device,
              },
              {
                name: "source",
                title: "Source",
                value: (i) => i.source,
              },
              {
                name: "medium",
                title: "Medium",
                value: (i) => i.medium,
              },
              {
                name: "campaign",
                title: "Campaign",
                value: (i) => i.campaign,
              },
              {
                name: "content",
                title: "Content",
                value: (i) => i.content,
              },
              {
                name: "term",
                title: "Term",
                value: (i) => i.term,
              },
              {
                name: "country",
                title: "Country",
                value: (i) => i.country,
              },
              {
                name: "city",
                title: "City",
                value: (i) => i.city,
              },
              {
                name: "fromUrl",
                title: "From URL",
                value: (i) => i.fromUrl,
              },
              {
                name: "fromRoute",
                title: "From Route",
                value: (i) => i.fromRoute,
              },
              {
                name: "cookie",
                title: "Cookie",
                value: (i) => i.cookie.substring(0, 5) + "...",
              },
            ]}
          />
        </div>
      </EditPageLayout>
    </>
  );
}
