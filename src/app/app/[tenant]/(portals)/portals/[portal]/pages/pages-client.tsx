"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import clsx from "clsx";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import UrlUtils from "@/utils/app/UrlUtils";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";

type PagesClientProps = {
  data: {
    portal: PortalWithDetailsDto;
    pages: {
      name: string;
      title: string;
      attributes: JsonPropertiesValuesDto | null;
      errors: string[];
      slug: string;
      href: string;
    }[];
    portalUrl: string;
  };
  params: any;
};

export default function PagesClient({ data, params }: PagesClientProps) {
  const { t } = useTranslation();

  return (
    <EditPageLayout
      title={t("models.portal.pages.plural")}
      withHome={false}
      menu={[
        {
          title: data.portal.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}`),
        },
        {
          title: t("models.portal.pages.plural"),
        },
      ]}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.pages.map((page) => {
          return (
            <div
              key={page.name}
              className={clsx(
                "border-border hover:border-primary group relative flex flex-col rounded-lg border hover:shadow-2xs",
                page.errors.length === 0 ? "bg-background" : "bg-red-50"
              )}
            >
              <Link href={page.name}>
                {page.href && (
                  <div>
                    <Link
                      href={page.href}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-secondary/80 text-muted-foreground hover:text-secondary-foreground hover:bg-secondary absolute right-3 top-4 hidden rounded-md p-1.5 group-hover:flex"
                    >
                      <ExternalLinkEmptyIcon className="h-4 w-4" />
                    </Link>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-col">
                    <div className="font-medium">{page.title}</div>
                    {page.errors.length > 0 && <div className="line-clamp-2 text-sm text-red-500">{page.errors.join(", ")}</div>}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
