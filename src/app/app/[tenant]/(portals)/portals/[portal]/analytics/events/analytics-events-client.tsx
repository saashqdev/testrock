"use client";

import { AnalyticsEvent, AnalyticsUniqueVisitor, Portal } from "@prisma/client";
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
  items: (AnalyticsEvent & {
    uniqueVisitor: AnalyticsUniqueVisitor & {
      portalUser: { email: string } | null;
    };
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

export default function AnalyticsEventsClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateSearchParams = (callback: (params: URLSearchParams) => void) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    callback(newSearchParams);
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <EditPageLayout
        title={t("analytics.events")}
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
                    {i.uniqueVisitor.portalUser ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            updateSearchParams((params) => {
                              if (searchParams?.get("portalUserId") || !i.uniqueVisitor.portalUserId) {
                                params.delete("portalUserId");
                              } else {
                                params.set("portalUserId", i.uniqueVisitor.portalUserId);
                              }
                            });
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
                          updateSearchParams((params) => {
                            if (searchParams?.get("cookie")) {
                              params.delete("cookie");
                            } else {
                              params.set("cookie", i.uniqueVisitor.cookie);
                            }
                          });
                        }}
                        className="underline"
                      >
                        <div className="text-xs text-muted-foreground">
                          <span className="">Anon</span>: {i.uniqueVisitor.cookie.substring(0, 5) + "..."}
                        </div>
                      </button>
                    )}
                  </div>
                  <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-xs text-muted-foreground">
                    {DateUtils.dateAgo(i.createdAt)}
                  </time>
                </div>
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
    </>
  );
}
