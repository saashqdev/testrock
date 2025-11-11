"use client";

import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalyticsPageView, AnalyticsUniqueVisitor, Portal } from "@prisma/client";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import UrlUtils from "@/utils/app/UrlUtils";
import DateUtils from "@/lib/shared/DateUtils";

type PageViewsClientProps = {
  data: {
    portal: Portal;
    items: (AnalyticsPageView & {
      uniqueVisitor: AnalyticsUniqueVisitor & {
        portalUser: { email: string } | null;
      };
    })[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
  };
  params: any;
};

export default function PageViewsClient({ data, params }: PageViewsClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = (key: string, value: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    if (value === null) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value);
    }
    const search = newSearchParams.toString();
    const query = search ? `?${search}` : "";
    router.push(`${window.location.pathname}${query}`);
  };

  return (
    <EditPageLayout
      withHome={false}
      tabs={[
        {
          name: t("analytics.overview"),
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics`),
        },
        {
          name: t("analytics.uniqueVisitors"),
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics/visitors`),
        },
        {
          name: t("analytics.pageViews"),
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics/page-views`),
        },
        {
          name: t("analytics.events"),
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics/events`),
        },
      ]}
      title={t("analytics.pageViews")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
        </>
      }
    >
      <div className="space-y-2">
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
                    {i.uniqueVisitor.portalUser ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (searchParams?.get("portalUserId") || !i.uniqueVisitor.portalUserId) {
                              updateSearchParams("portalUserId", null);
                            } else {
                              updateSearchParams("portalUserId", i.uniqueVisitor.portalUserId);
                            }
                          }}
                          disabled={!i.uniqueVisitor.portalUserId}
                          className="underline"
                        >
                          <div className="text-xs">{i.uniqueVisitor.portalUser.email}</div>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (searchParams?.get("cookie")) {
                            updateSearchParams("cookie", null);
                          } else {
                            updateSearchParams("cookie", i.uniqueVisitor.cookie);
                          }
                        }}
                        className="underline"
                      >
                        <div className="text-muted-foreground text-xs">
                          <span className="">Anon</span>: {i.uniqueVisitor.cookie.substring(0, 5) + "..."}
                        </div>
                      </button>
                    )}
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
      </div>
    </EditPageLayout>
  );
}
