"use client";

import { AnalyticsUniqueVisitor, Portal } from "@prisma/client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import UrlUtils from "@/utils/app/UrlUtils";
import DateUtils from "@/lib/shared/DateUtils";

type LoaderData = {
  portal: Portal;
  items: (AnalyticsUniqueVisitor & {
    portalUser: { email: string } | null;
    _count: {
      pageViews: number;
      events: number;
    };
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

export default function AnalyticsVisitorsClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateSearchParams = (key: string, value: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === null) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value);
    }
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <EditPageLayout
        title={t("analytics.uniqueVisitors")}
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
        buttons={
          <>
            <InputFilters filters={data.filterableProperties} />
          </>
        }
      >
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
                    {i.portalUser ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (searchParams.get("portalUserId") || !i.portalUserId) {
                              updateSearchParams("portalUserId", null);
                            } else {
                              updateSearchParams("portalUserId", i.portalUserId);
                            }
                          }}
                          className="underline"
                        >
                          <div className="text-xs">{i.portalUser.email}</div>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (searchParams.get("cookie")) {
                            updateSearchParams("cookie", null);
                          } else {
                            updateSearchParams("cookie", i.cookie);
                          }
                        }}
                        className="underline"
                      >
                        <div className="text-muted-foreground text-xs">
                          <span className="">Anon</span>: {i.cookie.substring(0, 5) + "..."}
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
      </EditPageLayout>
    </>
  );
}
