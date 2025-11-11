"use client";

import { AnalyticsPageView, AnalyticsUniqueVisitor } from "@prisma/client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateUtils from "@/lib/shared/DateUtils";
import Tabs from "@/components/ui/tabs/Tabs";

type PageViewsClientProps = {
  data: {
    items: (AnalyticsPageView & {
      uniqueVisitor: AnalyticsUniqueVisitor & {
        user: { email: string } | null;
      };
      portal: { id: string; title: string } | null;
    })[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
  };
  portalsConfig: { enabled?: boolean; analytics?: boolean } | null | undefined;
};

export default function PageViewsClient({ data, portalsConfig }: PageViewsClientProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
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

          <InputFilters filters={data.filterableProperties} />
        </div>

        <TableSimple
          items={data.items}
          pagination={data.pagination}
          headers={[
            {
              name: "date",
              title: "Date",
              value: (i) => (
                <div className="flex flex-col">
                  <div>
                    <div>
                      {i.uniqueVisitor.user ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!i.uniqueVisitor.userId) return;
                              updateSearchParams("userId", i.uniqueVisitor.userId);
                            }}
                            disabled={!i.uniqueVisitor.userId}
                            className="underline"
                          >
                            <div className="text-xs">{i.uniqueVisitor.user.email}</div>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            updateSearchParams("cookie", i.uniqueVisitor.cookie);
                          }}
                          className="underline"
                        >
                          <div className="text-muted-foreground text-xs">
                            <span className="">Anon</span>: {i.uniqueVisitor.cookie.substring(0, 5) + "..."}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                  <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-muted-foreground text-xs">
                    {DateUtils.dateAgo(i.createdAt)}
                  </time>
                </div>
              ),
            },
            {
              name: "url",
              title: "URL",
              value: (i) => (
                <div className="max-w-xs truncate">
                  <div className="truncate font-medium">{i.url}</div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSearchParams("route", i.route ?? "null");
                    }}
                    className="truncate underline"
                  >
                    <div className="text-muted-foreground text-xs">{i.url !== i.route && i.route}</div>
                  </button>
                </div>
              ),
            },
            {
              name: "portal",
              title: "Portal",
              value: (i) => <div className="text-muted-foreground font-medium">{i.portal?.title}</div>,
              hidden: !portalsConfig?.enabled || !portalsConfig?.analytics,
            },
            {
              name: "httpReferrer",
              title: "HTTP Referrer",
              value: (i) => <div className="max-w-xs truncate">{i.uniqueVisitor.httpReferrer}</div>,
            },
            {
              name: "via",
              title: "Via",
              value: (i) => i.uniqueVisitor.via,
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
              title: "From url",
              value: (i) => (
                <div className="max-w-xs truncate">
                  <div className="truncate font-medium">{i.uniqueVisitor.fromUrl}</div>
                  <div className="text-muted-foreground text-xs">{i.uniqueVisitor.fromUrl !== i.uniqueVisitor.fromRoute && i.uniqueVisitor.fromRoute}</div>
                </div>
              ),
            },
          ]}
        />
      </EditPageLayout>
    </>
  );
}
